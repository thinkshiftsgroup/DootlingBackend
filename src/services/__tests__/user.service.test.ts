import { prisma } from "../../prisma";
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "../user.service";
import { uploadToCloudinary } from "../../utils/cloudinary";

// Mock dependencies
jest.mock("../../prisma");
jest.mock("../../utils/cloudinary");

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userKycProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
} as any;

const mockUploadToCloudinary = uploadToCloudinary as jest.MockedFunction<typeof uploadToCloudinary>;

// Mock the prisma export
(prisma as any) = mockPrisma;

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProfile", () => {
    it("should return user profile with KYC data when user exists", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        fullName: "Test User",
        firstname: "Test",
        lastname: "User",
        phone: "+1234567890",
        profilePhotoUrl: "http://example.com/photo.jpg",
        isVerified: true,
        createdAt: new Date(),
      };

      const mockKycProfile = {
        userId: 1,
        middleName: "Middle",
        gender: "Male",
        dateOfBirth: new Date("1990-01-01"),
        meansOfIdentification: "Passport",
        identificationNumber: "PASS123",
        identificationExpiry: new Date("2025-01-01"),
        countryOfResidency: "USA",
        contactAddress: "123 Test St",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(mockKycProfile);

      const result = await getUserProfile(1);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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

      expect(mockPrisma.userKycProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 1 },
      });

      expect(result).toEqual({
        user: {
          ...mockUser,
          middleName: "Middle",
          gender: "Male",
          dateOfBirth: new Date("1990-01-01"),
          meansOfIdentification: "Passport",
          identificationNumber: "PASS123",
          identificationExpiry: new Date("2025-01-01"),
          countryOfResidency: "USA",
          contactAddress: "123 Test St",
        },
      });
    });

    it("should return user profile with null KYC fields when no KYC profile exists", async () => {
      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        fullName: "Test User",
        firstname: "Test",
        lastname: "User",
        phone: "+1234567890",
        profilePhotoUrl: "http://example.com/photo.jpg",
        isVerified: true,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      const result = await getUserProfile(1);

      expect(result).toEqual({
        user: {
          ...mockUser,
          middleName: null,
          gender: null,
          dateOfBirth: null,
          meansOfIdentification: null,
          identificationNumber: null,
          identificationExpiry: null,
          countryOfResidency: null,
          contactAddress: null,
        },
      });
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getUserProfile(999)).rejects.toThrow("User not found");
    });
  });

  describe("updateUserProfile", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      username: "testuser",
      fullName: "Test User",
      firstname: "Test",
      lastname: "User",
      phone: "+1234567890",
      profilePhotoUrl: "http://example.com/photo.jpg",
    };

    beforeEach(() => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    });

    it("should update user first name and last name", async () => {
      const updateData = {
        firstname: "John",
        lastname: "Doe",
      };

      const updatedUser = {
        ...mockUser,
        firstname: "John",
        lastname: "Doe",
        fullName: "John Doe",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      const result = await updateUserProfile(1, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          firstname: "John",
          lastname: "Doe",
          fullName: "John Doe",
        },
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

      expect(result).toEqual({
        message: "Profile updated successfully",
        user: {
          ...updatedUser,
          middleName: null,
          gender: null,
          dateOfBirth: null,
          meansOfIdentification: null,
          identificationNumber: null,
          identificationExpiry: null,
          countryOfResidency: null,
          contactAddress: null,
        },
      });
    });

    it("should update user phone", async () => {
      const updateData = {
        phone: "+9876543210",
      };

      const updatedUser = {
        ...mockUser,
        phone: "+9876543210",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      const result = await updateUserProfile(1, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          phone: "+9876543210",
        },
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

      expect(result.user.phone).toBe("+9876543210");
    });

    it("should update only first name and keep existing last name", async () => {
      const updateData = {
        firstname: "Jane",
      };

      const updatedUser = {
        ...mockUser,
        firstname: "Jane",
        fullName: "Jane User",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      await updateUserProfile(1, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          firstname: "Jane",
          fullName: "Jane User",
        },
        select: expect.any(Object),
      });
    });

    it("should update only last name and keep existing first name", async () => {
      const updateData = {
        lastname: "Smith",
      };

      const updatedUser = {
        ...mockUser,
        lastname: "Smith",
        fullName: "Test Smith",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      await updateUserProfile(1, updateData);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          lastname: "Smith",
          fullName: "Test Smith",
        },
        select: expect.any(Object),
      });
    });

    it("should handle empty phone string", async () => {
      const updateData = {
        phone: "",
      };

      const updatedUser = {
        ...mockUser,
        phone: null,
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);

      const result = await updateUserProfile(1, updateData);

      expect(result.user.phone).toBeNull();
    });

    it("should create new KYC profile when updating KYC fields for first time", async () => {
      const updateData = {
        middleName: "William",
        gender: "Female",
        dateOfBirth: "1992-05-15",
      };

      const updatedUser = { ...mockUser };
      const createdKycProfile = {
        userId: 1,
        status: "IN_PROGRESS",
        middleName: "William",
        gender: "Female",
        dateOfBirth: new Date("1992-05-15"),
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdKycProfile);

      const result = await updateUserProfile(1, updateData);

      expect(mockPrisma.userKycProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          status: "IN_PROGRESS",
          middleName: "William",
          gender: "Female",
          dateOfBirth: new Date("1992-05-15"),
        },
      });

      expect(result.user.middleName).toBe("William");
      expect(result.user.gender).toBe("Female");
      expect(result.user.dateOfBirth).toEqual(new Date("1992-05-15"));
    });

    it("should update existing KYC profile", async () => {
      const updateData = {
        meansOfIdentification: "Driver License",
        identificationNumber: "DL123456",
        countryOfResidency: "Canada",
      };

      const updatedUser = { ...mockUser };
      const existingKycProfile = {
        userId: 1,
        middleName: "William",
        gender: "Female",
        dateOfBirth: new Date("1992-05-15"),
      };
      const updatedKycProfile = {
        ...existingKycProfile,
        meansOfIdentification: "Driver License",
        identificationNumber: "DL123456",
        countryOfResidency: "Canada",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(existingKycProfile);
      mockPrisma.userKycProfile.update.mockResolvedValue(updatedKycProfile);

      const result = await updateUserProfile(1, updateData);

      expect(mockPrisma.userKycProfile.update).toHaveBeenCalledWith({
        where: { userId: 1 },
        data: {
          meansOfIdentification: "Driver License",
          identificationNumber: "DL123456",
          countryOfResidency: "Canada",
        },
      });

      expect(result.user.meansOfIdentification).toBe("Driver License");
      expect(result.user.identificationNumber).toBe("DL123456");
      expect(result.user.countryOfResidency).toBe("Canada");
    });

    it("should handle Date objects for date fields", async () => {
      const updateData = {
        dateOfBirth: new Date("1990-01-01"),
        identificationExpiry: new Date("2025-12-31"),
      };

      const updatedUser = { ...mockUser };
      const createdKycProfile = {
        userId: 1,
        status: "IN_PROGRESS",
        dateOfBirth: new Date("1990-01-01"),
        identificationExpiry: new Date("2025-12-31"),
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdKycProfile);

      const result = await updateUserProfile(1, updateData);

      expect(result.user.dateOfBirth).toEqual(new Date("1990-01-01"));
      expect(result.user.identificationExpiry).toEqual(new Date("2025-12-31"));
    });

    it("should handle empty strings for optional fields", async () => {
      const updateData = {
        middleName: "",
        identificationNumber: "",
        contactAddress: "",
      };

      const updatedUser = { ...mockUser };
      const createdKycProfile = {
        userId: 1,
        status: "IN_PROGRESS",
        middleName: null,
        identificationNumber: null,
        contactAddress: null,
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(createdKycProfile);

      const result = await updateUserProfile(1, updateData);

      expect(result.user.middleName).toBeNull();
      expect(result.user.identificationNumber).toBeNull();
      expect(result.user.contactAddress).toBeNull();
    });

    it("should throw error when first name is empty string", async () => {
      const updateData = {
        firstname: "",
      };

      await expect(updateUserProfile(1, updateData)).rejects.toThrow("First name cannot be empty");
    });

    it("should throw error when first name is only whitespace", async () => {
      const updateData = {
        firstname: "   ",
      };

      await expect(updateUserProfile(1, updateData)).rejects.toThrow("First name cannot be empty");
    });

    it("should throw error when last name is empty string", async () => {
      const updateData = {
        lastname: "",
      };

      await expect(updateUserProfile(1, updateData)).rejects.toThrow("Last name cannot be empty");
    });

    it("should throw error when last name is only whitespace", async () => {
      const updateData = {
        lastname: "   ",
      };

      await expect(updateUserProfile(1, updateData)).rejects.toThrow("Last name cannot be empty");
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(updateUserProfile(999, { firstname: "John" })).rejects.toThrow("User not found");
    });

    it("should update all possible fields", async () => {
      const updateData = {
        firstname: "Alice",
        lastname: "Johnson",
        phone: "+1111111111",
        middleName: "Marie",
        gender: "Other",
        dateOfBirth: "1985-08-20",
        meansOfIdentification: "National ID",
        identificationNumber: "ID789012",
        identificationExpiry: "2030-06-15",
        countryOfResidency: "UK",
        contactAddress: "456 New Street, London",
      };

      const updatedUser = {
        ...mockUser,
        firstname: "Alice",
        lastname: "Johnson",
        fullName: "Alice Johnson",
        phone: "+1111111111",
      };

      const updatedKycProfile = {
        userId: 1,
        middleName: "Marie",
        gender: "Other",
        dateOfBirth: new Date("1985-08-20"),
        meansOfIdentification: "National ID",
        identificationNumber: "ID789012",
        identificationExpiry: new Date("2030-06-15"),
        countryOfResidency: "UK",
        contactAddress: "456 New Street, London",
      };

      mockPrisma.user.update.mockResolvedValue(updatedUser);
      mockPrisma.userKycProfile.findUnique.mockResolvedValue(null);
      mockPrisma.userKycProfile.create.mockResolvedValue(updatedKycProfile);

      const result = await updateUserProfile(1, updateData);

      expect(result.user).toEqual({
        ...updatedUser,
        middleName: "Marie",
        gender: "Other",
        dateOfBirth: new Date("1985-08-20"),
        meansOfIdentification: "National ID",
        identificationNumber: "ID789012",
        identificationExpiry: new Date("2030-06-15"),
        countryOfResidency: "UK",
        contactAddress: "456 New Street, London",
      });
    });
  });

  describe("uploadProfilePhoto", () => {
    const mockFile = {
      buffer: Buffer.from("test image data"),
      originalname: "test.jpg",
      mimetype: "image/jpeg",
    } as Express.Multer.File;

    it("should upload profile photo successfully", async () => {
      const mockUser = {
        id: 1,
        profilePhotoUrl: "http://example.com/photo.jpg",
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockUploadToCloudinary.mockResolvedValue("http://cloudinary.com/new-photo.jpg");
      mockPrisma.user.update.mockResolvedValue({
        id: 1,
        profilePhotoUrl: "http://cloudinary.com/new-photo.jpg",
      });

      const result = await uploadProfilePhoto(1, mockFile);

      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "image");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { profilePhotoUrl: "http://cloudinary.com/new-photo.jpg" },
        select: {
          id: true,
          profilePhotoUrl: true,
        },
      });

      expect(result).toEqual({
        message: "Profile photo uploaded successfully",
        profilePhotoUrl: "http://cloudinary.com/new-photo.jpg",
      });
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(uploadProfilePhoto(999, mockFile)).rejects.toThrow("User not found");
    });
  });
});
