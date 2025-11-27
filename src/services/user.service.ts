import { prisma } from "../prisma";
import { uploadToCloudinary } from "../utils/cloudinary";

interface UserProfileUpdate {
  firstname?: string;
  lastname?: string;
  middleName?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  phone?: string;
  meansOfIdentification?: string;
  identificationNumber?: string;
  identificationExpiry?: string | Date;
  countryOfResidency?: string;
  contactAddress?: string;
}

export const getUserProfile = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      firstname: true,
      lastname: true,
      phone: true,
      profilePhotoUrl: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("User not found");

  const kycProfile = await prisma.userKycProfile.findUnique({
    where: { userId },
  });

  return { 
    user: {
      ...user,
      middleName: kycProfile?.middleName || null,
      gender: kycProfile?.gender || null,
      dateOfBirth: kycProfile?.dateOfBirth || null,
      meansOfIdentification: kycProfile?.meansOfIdentification || null,
      identificationNumber: kycProfile?.identificationNumber || null,
      identificationExpiry: kycProfile?.identificationExpiry || null,
      countryOfResidency: kycProfile?.countryOfResidency || null,
      contactAddress: kycProfile?.contactAddress || null,
    }
  };
};

export const updateUserProfile = async (userId: number, data: UserProfileUpdate) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const updateData: any = {};

  if (data.firstname !== undefined) {
    if (!data.firstname.trim()) throw new Error("First name cannot be empty");
    updateData.firstname = data.firstname.trim();
  }

  if (data.lastname !== undefined) {
    if (!data.lastname.trim()) throw new Error("Last name cannot be empty");
    updateData.lastname = data.lastname.trim();
  }

  if (data.phone !== undefined) {
    updateData.phone = data.phone.trim() || null;
  }

  if (updateData.firstname || updateData.lastname) {
    const firstname = updateData.firstname || user.firstname;
    const lastname = updateData.lastname || user.lastname;
    updateData.fullName = `${firstname} ${lastname}`.trim();
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      firstname: true,
      lastname: true,
      phone: true,
      profilePhotoUrl: true,
    },
  });

  // Update or create KYC profile with additional fields
  const kycData: any = {};
  
  if (data.middleName !== undefined) {
    kycData.middleName = data.middleName.trim() || null;
  }
  
  if (data.gender !== undefined) {
    kycData.gender = data.gender;
  }
  
  if (data.dateOfBirth !== undefined) {
    kycData.dateOfBirth = typeof data.dateOfBirth === "string" ? new Date(data.dateOfBirth) : data.dateOfBirth;
  }
  
  if (data.meansOfIdentification !== undefined) {
    kycData.meansOfIdentification = data.meansOfIdentification;
  }
  
  if (data.identificationNumber !== undefined) {
    kycData.identificationNumber = data.identificationNumber.trim() || null;
  }
  
  if (data.identificationExpiry !== undefined) {
    kycData.identificationExpiry = typeof data.identificationExpiry === "string" ? new Date(data.identificationExpiry) : data.identificationExpiry;
  }
  
  if (data.countryOfResidency !== undefined) {
    kycData.countryOfResidency = data.countryOfResidency;
  }
  
  if (data.contactAddress !== undefined) {
    kycData.contactAddress = data.contactAddress.trim() || null;
  }

  let kycProfile = null;
  if (Object.keys(kycData).length > 0) {
    const existing = await prisma.userKycProfile.findUnique({ where: { userId } });
    
    if (existing) {
      kycProfile = await prisma.userKycProfile.update({
        where: { userId },
        data: kycData,
      });
    } else {
      kycProfile = await prisma.userKycProfile.create({
        data: {
          userId,
          status: "IN_PROGRESS",
          ...kycData,
        },
      });
    }
  }

  return { 
    message: "Profile updated successfully", 
    user: {
      ...updated,
      middleName: kycProfile?.middleName || null,
      gender: kycProfile?.gender || null,
      dateOfBirth: kycProfile?.dateOfBirth || null,
      meansOfIdentification: kycProfile?.meansOfIdentification || null,
      identificationNumber: kycProfile?.identificationNumber || null,
      identificationExpiry: kycProfile?.identificationExpiry || null,
      countryOfResidency: kycProfile?.countryOfResidency || null,
      contactAddress: kycProfile?.contactAddress || null,
    }
  };
};

export const uploadProfilePhoto = async (userId: number, file: Express.Multer.File) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const url = await uploadToCloudinary(file, "image");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { profilePhotoUrl: url },
    select: {
      id: true,
      profilePhotoUrl: true,
    },
  });

  return { message: "Profile photo uploaded successfully", profilePhotoUrl: updated.profilePhotoUrl };
};
