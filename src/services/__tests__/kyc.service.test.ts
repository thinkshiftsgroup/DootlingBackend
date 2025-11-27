import {
  getPersonalKyc,
  upsertPersonalKyc,
  getBusinessKyc,
  upsertBusinessKyc,
  listKycDocuments,
  saveKycDocuments,
  submitKyc,
  listPeps,
  savePeps,
  uploadKycDocuments,
} from "../kyc.service";
import { prisma } from "../../prisma";
import { uploadToCloudinary } from "../../utils/cloudinary";

// Mock dependencies
jest.mock("../../prisma");
jest.mock("../../utils/cloudinary");

const mockPrisma = {
  userKycProfile: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  businessKyc: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  kycDocument: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  pep: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
} as any;

// Mock the prisma export
(prisma as any) = mockPrisma;

const mockUploadToCloudinary = uploadToCloudinary as jest.MockedFunction<typeof uploadToCloudinary>;

describe("KYC Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPersonalKyc", () => {
    it("should return personal KYC profile", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        middleName: "William",
        gender: "Male",
        dateOfBirth: new Date("1990-01-01"),
        meansOfIdentification: "Passport",
        identificationNumber: "PASS123",
        identificationExpiry: new Date("2025-01-01"),
        countryOfResidency: "USA",
        contactAddress: "123 Test St",
        status: "IN_PROGRESS",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockProfile);

      const result = await getPersonalKyc(1);

      expect(mockPrisma.userKycProfile.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({ profile: mockProfile });
    });

    it("should return null when profile does not exist", async () => {
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      const result = await getPersonalKyc(1);

      expect(result).toEqual({ profile: null });
    });
  });

  describe("upsertPersonalKyc", () => {
    it("should create new personal KYC profile", async () => {
      const data = {
        middleName: "William",
        gender: "Male",
        dateOfBirth: "1990-01-01",
        meansOfIdentification: "Passport",
        identificationNumber: "PASS123",
        identificationExpiry: "2025-01-01",
        countryOfResidency: "USA",
        contactAddress: "123 Test St",
      };

      const createdProfile = {
        id: 1,
        userId: 1,
        status: "IN_PROGRESS",
        ...data,
        dateOfBirth: new Date("1990-01-01"),
        identificationExpiry: new Date("2025-01-01"),
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdProfile);

      const result = await upsertPersonalKyc(1, data);

      expect(mockPrisma.userKycProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          status: "IN_PROGRESS",
          ...data,
          dateOfBirth: new Date("1990-01-01"),
          identificationExpiry: new Date("2025-01-01"),
        },
      });

      expect(result).toEqual({
        message: "Personal KYC profile created",
        profile: createdProfile,
      });
    });

    it("should update existing personal KYC profile with NOT_STARTED status", async () => {
      const data = {
        gender: "Female",
        countryOfResidency: "UK",
      };

      const existingProfile = {
        id: 1,
        userId: 1,
        status: "NOT_STARTED",
      };

      const updatedProfile = {
        ...existingProfile,
        status: "IN_PROGRESS",
        ...data,
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(existingProfile);
      mockPrisma.userKycProfile.update.mockResolvedValue(updatedProfile);

      const result = await upsertPersonalKyc(1, data);

      expect(mockPrisma.userKycProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          ...data,
          status: "IN_PROGRESS",
        },
      });

      expect(result).toEqual({
        message: "Personal KYC profile updated",
        profile: updatedProfile,
      });
    });

    it("should update existing personal KYC profile with other status", async () => {
      const data = {
        gender: "Other",
      };

      const existingProfile = {
        id: 1,
        userId: 1,
        status: "SUBMITTED",
      };

      const updatedProfile = {
        ...existingProfile,
        ...data,
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(existingProfile);
      mockPrisma.userKycProfile.update.mockResolvedValue(updatedProfile);

      const result = await upsertPersonalKyc(1, data);

      expect(mockPrisma.userKycProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          ...data,
          status: "SUBMITTED",
        },
      });

      expect(result).toEqual({
        message: "Personal KYC profile updated",
        profile: updatedProfile,
      });
    });

    it("should handle Date objects for date fields", async () => {
      const data = {
        dateOfBirth: new Date("1990-01-01"),
        identificationExpiry: new Date("2025-01-01"),
      };

      const createdProfile = {
        id: 1,
        userId: 1,
        status: "IN_PROGRESS",
        ...data,
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdProfile);

      await upsertPersonalKyc(1, data);

      expect(mockPrisma.userKycProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          status: "IN_PROGRESS",
          ...data,
        },
      });
    });

    it("should handle empty data", async () => {
      const data = {};

      const createdProfile = {
        id: 1,
        userId: 1,
        status: "IN_PROGRESS",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdProfile);

      const result = await upsertPersonalKyc(1, data);

      expect(result).toEqual({
        message: "Personal KYC profile created",
        profile: createdProfile,
      });
    });
  });

  describe("getBusinessKyc", () => {
    it("should return business KYC profile", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        businessName: "Test Business",
        companyType: "LLC",
        incorporationNumber: "INC123",
        dateOfIncorporation: new Date("2020-01-01"),
        countryOfIncorporation: "USA",
        taxNumber: "TAX123",
        companyAddress: "456 Business St",
        zipOrPostcode: "12345",
        stateOrProvince: "CA",
        city: "San Francisco",
        businessDescription: "Test business description",
        companyWebsite: "https://testbusiness.com",
      };

      mockPrisma.businessKyc.findUnique.mockResolvedValue(mockProfile);

      const result = await getBusinessKyc(1);

      expect(mockPrisma.businessKyc.findUnique).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({ profile: mockProfile });
    });

    it("should return null when business profile does not exist", async () => {
      mockPrisma.businessKyc.findUnique.mockResolvedValue(null);

      const result = await getBusinessKyc(1);

      expect(result).toEqual({ profile: null });
    });
  });

  describe("upsertBusinessKyc", () => {
    it("should create new business KYC profile", async () => {
      const data = {
        businessName: "Test Business",
        companyType: "LLC",
        incorporationNumber: "INC123",
        dateOfIncorporation: "2020-01-01",
        countryOfIncorporation: "USA",
        taxNumber: "TAX123",
        companyAddress: "456 Business St",
        zipOrPostcode: "12345",
        stateOrProvince: "CA",
        city: "San Francisco",
        businessDescription: "Test business description",
        companyWebsite: "https://testbusiness.com",
      };

      const createdProfile = {
        id: 1,
        userId: 1,
        ...data,
        dateOfIncorporation: new Date("2020-01-01"),
      };

      mockPrisma.businessKyc.findUnique.mockResolvedValue(null);
      mockPrisma.businessKyc.create.mockResolvedValue(createdProfile);

      const result = await upsertBusinessKyc(1, data);

      expect(mockPrisma.businessKyc.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          companyType: "LLC",
          incorporationNumber: "INC123",
          dateOfIncorporation: new Date("2020-01-01"),
          countryOfIncorporation: "USA",
          taxNumber: "TAX123",
          companyAddress: "456 Business St",
          zipOrPostcode: "12345",
          stateOrProvince: "CA",
          city: "San Francisco",
          businessDescription: "Test business description",
          companyWebsite: "https://testbusiness.com",
        },
      });

      expect(result).toEqual({
        message: "Business KYC created",
        profile: createdProfile,
      });
    });

    it("should update existing business KYC profile", async () => {
      const data = {
        businessName: "Updated Business",
        companyType: "Corporation",
      };

      const existingProfile = {
        id: 1,
        userId: 1,
        businessName: "Old Business",
      };

      const updatedProfile = {
        ...existingProfile,
        businessName: "Updated Business",
        companyType: "Corporation",
      };

      mockPrisma.businessKyc.findUnique.mockResolvedValue(existingProfile);
      mockPrisma.businessKyc.update.mockResolvedValue(updatedProfile);

      const result = await upsertBusinessKyc(1, data);

      expect(mockPrisma.businessKyc.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          businessName: "Updated Business",
          companyType: "Corporation",
        },
      });

      expect(result).toEqual({
        message: "Business KYC updated",
        profile: updatedProfile,
      });
    });

    it("should trim business name", async () => {
      const data = {
        businessName: "  Test Business  ",
      };

      const createdProfile = {
        id: 1,
        userId: 1,
        businessName: "Test Business",
      };

      mockPrisma.businessKyc.findUnique.mockResolvedValue(null);
      mockPrisma.businessKyc.create.mockResolvedValue(createdProfile);

      await upsertBusinessKyc(1, data);

      expect(mockPrisma.businessKyc.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "  Test Business  ",
        },
      });
    });

    it("should handle Date objects for dateOfIncorporation", async () => {
      const data = {
        businessName: "Test Business",
        dateOfIncorporation: new Date("2020-01-01"),
      };

      const createdProfile = {
        id: 1,
        userId: 1,
        businessName: "Test Business",
        dateOfIncorporation: new Date("2020-01-01"),
      };

      mockPrisma.businessKyc.findUnique.mockResolvedValue(null);
      mockPrisma.businessKyc.create.mockResolvedValue(createdProfile);

      await upsertBusinessKyc(1, data);

      expect(mockPrisma.businessKyc.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          dateOfIncorporation: new Date("2020-01-01"),
        },
      });
    });

    it("should throw error when business name is empty", async () => {
      const data = {
        businessName: "",
      };

      await expect(upsertBusinessKyc(1, data)).rejects.toThrow("Business name is required");
    });

    it("should throw error when business name is only whitespace", async () => {
      const data = {
        businessName: "   ",
      };

      await expect(upsertBusinessKyc(1, data)).rejects.toThrow("Business name is required");
    });

    it("should throw error when business name is missing", async () => {
      const data = {} as any;

      await expect(upsertBusinessKyc(1, data)).rejects.toThrow("Business name is required");
    });
  });

  describe("listKycDocuments", () => {
    it("should return list of KYC documents", async () => {
      const mockDocuments = [
        {
          id: 1,
          userId: 1,
          type: "GOVERNMENT_ID",
          url: "https://example.com/id.jpg",
        },
        {
          id: 2,
          userId: 1,
          type: "PROOF_OF_ADDRESS",
          url: "https://example.com/address.pdf",
        },
      ];

      mockPrisma.kycDocument.findMany.mockResolvedValue(mockDocuments);

      const result = await listKycDocuments(1);

      expect(mockPrisma.kycDocument.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({ documents: mockDocuments });
    });

    it("should return empty list when no documents exist", async () => {
      mockPrisma.kycDocument.findMany.mockResolvedValue([]);

      const result = await listKycDocuments(1);

      expect(result).toEqual({ documents: [] });
    });
  });

  describe("saveKycDocuments", () => {
    it("should save KYC documents successfully", async () => {
      const documents = [
        { type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" },
        { type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
      ];

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 2 });

      const result = await saveKycDocuments(1, documents);

      expect(mockPrisma.kycDocument.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1, type: { in: ["GOVERNMENT_ID", "PROOF_OF_ADDRESS"] } },
      });

      expect(mockPrisma.kycDocument.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" },
          { userId: 1, type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
        ],
      });

      expect(result).toEqual({
        message: "KYC documents saved",
        count: 2,
      });
    });

    it("should convert document types to uppercase", async () => {
      const documents = [
        { type: "government_id", url: "https://example.com/id.jpg" },
        { type: "proof_of_address", url: "https://example.com/address.pdf" },
      ];

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 2 });

      await saveKycDocuments(1, documents);

      expect(mockPrisma.kycDocument.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" },
          { userId: 1, type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
        ],
      });
    });

    it("should handle duplicate document types", async () => {
      const documents = [
        { type: "GOVERNMENT_ID", url: "https://example.com/id1.jpg" },
        { type: "GOVERNMENT_ID", url: "https://example.com/id2.jpg" },
        { type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
      ];

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 3 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 3 });

      await saveKycDocuments(1, documents);

      expect(mockPrisma.kycDocument.deleteMany).toHaveBeenCalledWith({
        where: { userId: 1, type: { in: ["GOVERNMENT_ID", "PROOF_OF_ADDRESS"] } },
      });
    });

    it("should handle non-string document types", async () => {
      const documents = [
        { type: "GOVERNMENT_ID" as any, url: "https://example.com/id.jpg" },
        { type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
      ];

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 2 });

      const result = await saveKycDocuments(1, documents);

      expect(mockPrisma.kycDocument.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" },
          { userId: 1, type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
        ],
      });

      expect(result).toEqual({
        message: "KYC documents saved",
        count: 2,
      });
    });

    it("should throw error when documents array is empty", async () => {
      await expect(saveKycDocuments(1, [])).rejects.toThrow("At least one document is required");
    });

    it("should throw error when documents is not an array", async () => {
      await expect(saveKycDocuments(1, null as any)).rejects.toThrow("At least one document is required");
      await expect(saveKycDocuments(1, {} as any)).rejects.toThrow("At least one document is required");
    });
  });

  describe("submitKyc", () => {
    it("should submit KYC successfully", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        countryOfResidency: "USA",
        contactAddress: "123 Test St",
        status: "IN_PROGRESS",
      };

      const updatedProfile = {
        ...mockProfile,
        status: "SUBMITTED",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockProfile);
      mockPrisma.userKycProfile.update.mockResolvedValue(updatedProfile);

      const result = await submitKyc(1);

      expect(mockPrisma.userKycProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: { status: "SUBMITTED" },
      });

      expect(result).toEqual({
        message: "KYC submitted for approval",
        profile: updatedProfile,
      });
    });

    it("should throw error when personal KYC profile not found", async () => {
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      await expect(submitKyc(1)).rejects.toThrow("Personal KYC profile not found");
    });

    it("should throw error when countryOfResidency is missing", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        contactAddress: "123 Test St",
        status: "IN_PROGRESS",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockProfile);

      await expect(submitKyc(1)).rejects.toThrow("Personal KYC information is incomplete");
    });

    it("should throw error when contactAddress is missing", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        countryOfResidency: "USA",
        status: "IN_PROGRESS",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockProfile);

      await expect(submitKyc(1)).rejects.toThrow("Personal KYC information is incomplete");
    });

    it("should throw error when both countryOfResidency and contactAddress are missing", async () => {
      const mockProfile = {
        id: 1,
        userId: 1,
        status: "IN_PROGRESS",
      };

      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockProfile);

      await expect(submitKyc(1)).rejects.toThrow("Personal KYC information is incomplete");
    });
  });

  describe("listPeps", () => {
    it("should return list of PEPs", async () => {
      const mockPeps = [
        {
          id: 1,
          userId: 1,
          name: "John Doe",
          position: "CEO",
          description: "Test description",
        },
        {
          id: 2,
          userId: 1,
          name: "Jane Smith",
          position: "Director",
        },
      ];

      mockPrisma.pep.findMany.mockResolvedValue(mockPeps);

      const result = await listPeps(1);

      expect(mockPrisma.pep.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({ peps: mockPeps });
    });

    it("should return empty list when no PEPs exist", async () => {
      mockPrisma.pep.findMany.mockResolvedValue([]);

      const result = await listPeps(1);

      expect(result).toEqual({ peps: [] });
    });
  });

  describe("savePeps", () => {
    it("should save PEPs successfully", async () => {
      const peps = [
        { name: "John Doe", position: "CEO", description: "Test description" },
        { name: "Jane Smith", position: "Director" },
      ];

      mockPrisma.pep.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.pep.createMany.mockResolvedValue({ count: 2 });

      const result = await savePeps(1, peps);

      expect(mockPrisma.pep.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(mockPrisma.pep.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, name: "John Doe", position: "CEO", description: "Test description" },
          { userId: 1, name: "Jane Smith", position: "Director" },
        ],
      });

      expect(result).toEqual({
        message: "PEPs saved",
        count: 2,
      });
    });

    it("should save PEPs without description", async () => {
      const peps = [
        { name: "John Doe", position: "CEO" },
      ];

      mockPrisma.pep.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.pep.createMany.mockResolvedValue({ count: 1 });

      await savePeps(1, peps);

      expect(mockPrisma.pep.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 1, name: "John Doe", position: "CEO" },
        ],
      });
    });

    it("should handle empty PEPs array", async () => {
      const peps: any[] = [];

      mockPrisma.pep.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.pep.createMany.mockResolvedValue({ count: 0 });

      const result = await savePeps(1, peps);

      expect(result).toEqual({
        message: "PEPs saved",
        count: 0,
      });
    });
  });

  describe("uploadKycDocuments", () => {
    const mockFile = {
      buffer: Buffer.from("test file content"),
      originalname: "test.jpg",
      mimetype: "image/jpeg",
    } as Express.Multer.File;

    it("should upload KYC documents successfully", async () => {
      const files = {
        governmentId: [mockFile],
        proofOfAddress: [mockFile],
      };

      mockUploadToCloudinary
        .mockResolvedValueOnce("https://cloudinary.com/id.jpg")
        .mockResolvedValueOnce("https://cloudinary.com/address.pdf");

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 2 });

      const result = await uploadKycDocuments(1, files);

      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(2);
      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "auto");

      expect(result).toEqual({
        message: "Documents uploaded successfully",
        count: 2,
        documents: [
          { type: "GOVERNMENT_ID", url: "https://cloudinary.com/id.jpg" },
          { type: "PROOF_OF_ADDRESS", url: "https://cloudinary.com/address.pdf" },
        ],
      });
    });

    it("should handle multiple files for same document type", async () => {
      const files = {
        governmentId: [mockFile, mockFile],
      };

      mockUploadToCloudinary
        .mockResolvedValueOnce("https://cloudinary.com/id1.jpg")
        .mockResolvedValueOnce("https://cloudinary.com/id2.jpg");

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 2 });

      const result = await uploadKycDocuments(1, files);

      expect(result).toEqual({
        message: "Documents uploaded successfully",
        count: 2,
        documents: [
          { type: "GOVERNMENT_ID", url: "https://cloudinary.com/id1.jpg" },
          { type: "GOVERNMENT_ID", url: "https://cloudinary.com/id2.jpg" },
        ],
      });
    });

    it("should ignore unknown field names", async () => {
      const files = {
        unknownField: [mockFile],
        governmentId: [mockFile],
      };

      mockUploadToCloudinary.mockResolvedValue("https://cloudinary.com/id.jpg");
      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 1 });

      const result = await uploadKycDocuments(1, files);

      expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].type).toBe("GOVERNMENT_ID");
    });

    it("should handle empty file arrays", async () => {
      const files = {
        governmentId: [],
        proofOfAddress: [mockFile],
      };

      mockUploadToCloudinary.mockResolvedValue("https://cloudinary.com/address.pdf");
      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 1 });

      const result = await uploadKycDocuments(1, files);

      expect(result).toEqual({
        message: "Documents uploaded successfully",
        count: 1,
        documents: [
          { type: "PROOF_OF_ADDRESS", url: "https://cloudinary.com/address.pdf" },
        ],
      });
    });

    it("should throw error when no valid documents uploaded", async () => {
      const files = {
        unknownField: [mockFile],
      };

      await expect(uploadKycDocuments(1, files)).rejects.toThrow("No valid documents uploaded");
    });

    it("should throw error when files object is empty", async () => {
      const files = {};

      await expect(uploadKycDocuments(1, files)).rejects.toThrow("No valid documents uploaded");
    });

    it("should handle all document types", async () => {
      const files = {
        governmentId: [mockFile],
        incorporationCertificate: [mockFile],
        articleOfAssociation: [mockFile],
        proofOfAddress: [mockFile],
        selfieWithId: [mockFile],
        bankStatement: [mockFile],
        additionalDocuments: [mockFile],
      };

      const mockUrls = [
        "https://cloudinary.com/id.jpg",
        "https://cloudinary.com/inc.pdf",
        "https://cloudinary.com/art.pdf",
        "https://cloudinary.com/address.pdf",
        "https://cloudinary.com/selfie.jpg",
        "https://cloudinary.com/bank.pdf",
        "https://cloudinary.com/additional.pdf",
      ];

      mockUploadToCloudinary.mockImplementation((file) => {
        return Promise.resolve(mockUrls.shift()!);
      });

      mockPrisma.kycDocument.deleteMany.mockResolvedValue({ count: 7 });
      mockPrisma.kycDocument.createMany.mockResolvedValue({ count: 7 });

      const result = await uploadKycDocuments(1, files);

      expect(result.documents).toEqual([
        { type: "GOVERNMENT_ID", url: "https://cloudinary.com/id.jpg" },
        { type: "INCORPORATION_CERTIFICATE", url: "https://cloudinary.com/inc.pdf" },
        { type: "ARTICLE_OF_ASSOCIATION", url: "https://cloudinary.com/art.pdf" },
        { type: "PROOF_OF_ADDRESS", url: "https://cloudinary.com/address.pdf" },
        { type: "SELFIE_WITH_ID", url: "https://cloudinary.com/selfie.jpg" },
        { type: "BANK_STATEMENT", url: "https://cloudinary.com/bank.pdf" },
        { type: "ADDITIONAL", url: "https://cloudinary.com/additional.pdf" },
      ]);
    });
  });
});
