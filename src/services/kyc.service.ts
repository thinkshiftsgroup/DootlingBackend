import { prisma } from "../prisma";
import { uploadToCloudinary } from "../utils/cloudinary";

interface PersonalKycInput {
  middleName?: string;
  gender?: string;
  dateOfBirth?: Date | string;
  meansOfIdentification?: string;
  identificationNumber?: string;
  identificationExpiry?: Date | string;
  countryOfResidency?: string;
  contactAddress?: string;
}

interface BusinessKycInput {
  businessName: string;
  companyType?: string;
  incorporationNumber?: string;
  dateOfIncorporation?: Date | string;
  countryOfIncorporation?: string;
  taxNumber?: string;
  companyAddress?: string;
  zipOrPostcode?: string;
  stateOrProvince?: string;
  city?: string;
  businessDescription?: string;
  companyWebsite?: string;
}

type KycStatusString = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "APPROVED" | "REJECTED";

type KycDocumentTypeString =
  | "GOVERNMENT_ID"
  | "INCORPORATION_CERTIFICATE"
  | "ARTICLE_OF_ASSOCIATION"
  | "PROOF_OF_ADDRESS"
  | "SELFIE_WITH_ID"
  | "BANK_STATEMENT"
  | "ADDITIONAL";

interface KycDocumentInput {
  type: KycDocumentTypeString | string;
  url: string;
}

export const getPersonalKyc = async (userId: number) => {
  const profile = await prisma.userKycProfile.findUnique({ where: { userId } });
  return { profile };
};

export const upsertPersonalKyc = async (userId: number, data: PersonalKycInput) => {
  const existing = await prisma.userKycProfile.findUnique({ where: { userId } });

  const payload: any = { ...data };

  if (payload.dateOfBirth && typeof payload.dateOfBirth === "string") {
    payload.dateOfBirth = new Date(payload.dateOfBirth);
  }
  if (payload.identificationExpiry && typeof payload.identificationExpiry === "string") {
    payload.identificationExpiry = new Date(payload.identificationExpiry);
  }

  if (!existing) {
    const created = await prisma.userKycProfile.create({
      data: {
        userId,
        status: "IN_PROGRESS",
        ...payload,
      },
    });
    return { message: "Personal KYC profile created", profile: created };
  }

  const updated = await prisma.userKycProfile.update({
    where: { userId },
    data: {
      ...payload,
      status: (existing.status as KycStatusString) === "NOT_STARTED" ? "IN_PROGRESS" : existing.status,
    },
  });

  return { message: "Personal KYC profile updated", profile: updated };
};

export const getBusinessKyc = async (userId: number) => {
  const profile = await prisma.businessKyc.findUnique({ where: { userId } });
  return { profile };
};

export const upsertBusinessKyc = async (userId: number, data: BusinessKycInput) => {
  if (!data.businessName || !data.businessName.trim()) {
    throw new Error("Business name is required");
  }

  const existing = await prisma.businessKyc.findUnique({ where: { userId } });

  const payload: any = { ...data };

  if (payload.dateOfIncorporation && typeof payload.dateOfIncorporation === "string") {
    payload.dateOfIncorporation = new Date(payload.dateOfIncorporation);
  }

  if (!existing) {
    const created = await prisma.businessKyc.create({
      data: {
        userId,
        businessName: data.businessName.trim(),
        ...payload,
      },
    });
    return { message: "Business KYC created", profile: created };
  }

  const updated = await prisma.businessKyc.update({
    where: { userId },
    data: {
      ...payload,
      businessName: data.businessName.trim(),
    },
  });

  return { message: "Business KYC updated", profile: updated };
};

export const listKycDocuments = async (userId: number) => {
  const documents = await prisma.kycDocument.findMany({ where: { userId } });
  return { documents };
};

export const saveKycDocuments = async (userId: number, documents: KycDocumentInput[]) => {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new Error("At least one document is required");
  }

  const normalizedDocs = documents.map((doc) => ({
    type: typeof doc.type === "string" ? (doc.type.toUpperCase() as KycDocumentTypeString) : doc.type,
    url: doc.url,
  }));

  // Remove existing documents of the same types for idempotency
  const types = Array.from(new Set(normalizedDocs.map((d) => d.type))) as KycDocumentTypeString[];

  await prisma.kycDocument.deleteMany({
    where: { userId, type: { in: types } },
  });

  const created = await prisma.kycDocument.createMany({
    data: normalizedDocs.map((d) => ({
      userId,
      type: d.type,
      url: d.url,
    })),
  });

  return { message: "KYC documents saved", count: created.count };
};

export const submitKyc = async (userId: number) => {
  const profile = await prisma.userKycProfile.findUnique({ where: { userId } });

  if (!profile) {
    throw new Error("Personal KYC profile not found");
  }

  if (!profile.countryOfResidency || !profile.contactAddress) {
    throw new Error("Personal KYC information is incomplete");
  }

  const updated = await prisma.userKycProfile.update({
    where: { userId },
    data: { status: "SUBMITTED" },
  });

  return { message: "KYC submitted for approval", profile: updated };
};

export const listPeps = async (userId: number) => {
  const peps = await (prisma as any).pep.findMany({ where: { userId } });
  return { peps };
};

export const savePeps = async (userId: number, peps: { name: string; position: string; description?: string }[]) => {
  await (prisma as any).pep.deleteMany({ where: { userId } });
  const created = await (prisma as any).pep.createMany({
    data: peps.map(p => ({ userId, name: p.name, position: p.position, description: p.description })),
  });
  return { message: "PEPs saved", count: created.count };
};

export const uploadKycDocuments = async (userId: number, files: { [fieldname: string]: Express.Multer.File[] }) => {
  const documentTypeMap: { [key: string]: KycDocumentTypeString } = {
    governmentId: "GOVERNMENT_ID",
    incorporationCertificate: "INCORPORATION_CERTIFICATE",
    articleOfAssociation: "ARTICLE_OF_ASSOCIATION",
    proofOfAddress: "PROOF_OF_ADDRESS",
    selfieWithId: "SELFIE_WITH_ID",
    bankStatement: "BANK_STATEMENT",
    additionalDocuments: "ADDITIONAL",
  };

  const uploadedDocuments: { type: KycDocumentTypeString; url: string }[] = [];

  for (const [fieldName, fileArray] of Object.entries(files)) {
    const docType = documentTypeMap[fieldName];
    if (!docType) continue;

    for (const file of fileArray) {
      const url = await uploadToCloudinary(file, "auto");
      uploadedDocuments.push({ type: docType, url });
    }
  }

  if (uploadedDocuments.length === 0) {
    throw new Error("No valid documents uploaded");
  }

  const types = Array.from(new Set(uploadedDocuments.map((d) => d.type))) as KycDocumentTypeString[];
  await prisma.kycDocument.deleteMany({
    where: { userId, type: { in: types } },
  });

  const created = await prisma.kycDocument.createMany({
    data: uploadedDocuments.map((d) => ({
      userId,
      type: d.type,
      url: d.url,
    })),
  });

  return {
    message: "Documents uploaded successfully",
    count: created.count,
    documents: uploadedDocuments,
  };
};
