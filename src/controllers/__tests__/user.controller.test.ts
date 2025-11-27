import { Request, Response } from "express";
import * as userController from "../user.controller";
import * as userService from "../../services/user.service";

// Mock dependencies
jest.mock("../../services/user.service");

const mockUserService = userService as jest.Mocked<typeof userService>;

// Mock Express Request and Response
interface MockRequest extends Partial<Request> {
  user?: {
    id: number;
    email: string;
    username: string | null;
    isVerified: boolean;
    userType: string;
  };
  file?: Express.Multer.File;
}

const mockRequest = (body: any = {}, user: any = null, file: any = null): MockRequest => ({
  body,
  user,
  file,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("User Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should get user profile successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        user: {
          id: 1,
          email: "test@example.com",
          fullName: "John Doe",
          firstname: "John",
          lastname: "Doe",
          username: "johndoe1234",
          phone: "+1234567890",
          profilePhoto: "https://example.com/photo.jpg",
          isVerified: true,
          userType: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      mockUserService.getUserProfile.mockResolvedValue(expectedResult);

      await userController.getProfile(req as Request, res as Response);

      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await userController.getProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockUserService.getUserProfile).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("User not found");
      mockUserService.getUserProfile.mockRejectedValue(error);

      await expect(userController.getProfile(req as Request, res as Response)).rejects.toThrow("User not found");

      expect(mockUserService.getUserProfile).toHaveBeenCalledWith(1);
    });
  });

  describe("updateProfile", () => {
    it("should update user profile successfully", async () => {
      const updateData = {
        fullName: "John Smith",
        firstname: "John",
        lastname: "Smith",
        phone: "+1234567890",
        username: "johnsmith1234",
      };

      const req = mockRequest(updateData, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Profile updated successfully",
        user: {
          id: 1,
          email: "test@example.com",
          fullName: "John Smith",
          firstname: "John",
          lastname: "Smith",
          phone: "+1234567890",
          username: "johnsmith1234",
          updatedAt: new Date(),
        },
      } as any;

      mockUserService.updateUserProfile.mockResolvedValue(expectedResult);

      await userController.updateProfile(req as Request, res as Response);

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(1, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle empty update data", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Profile updated successfully",
        user: {
          id: 1,
          email: "test@example.com",
          updatedAt: new Date(),
        },
      } as any;

      mockUserService.updateUserProfile.mockResolvedValue(expectedResult);

      await userController.updateProfile(req as Request, res as Response);

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(1, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await userController.updateProfile(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockUserService.updateUserProfile).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const updateData = { fullName: "John Smith" };
      const req = mockRequest(updateData, { id: 1 });
      const res = mockResponse();

      const error = new Error("Update failed");
      mockUserService.updateUserProfile.mockRejectedValue(error);

      await expect(userController.updateProfile(req as Request, res as Response)).rejects.toThrow("Update failed");

      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(1, updateData);
    });
  });

  describe("uploadProfilePhoto", () => {
    it("should upload profile photo successfully", async () => {
      const mockFile = {
        fieldname: "photo",
        originalname: "profile.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        size: 1024,
        destination: "/tmp",
        filename: "profile.jpg",
        path: "/tmp/profile.jpg",
        buffer: Buffer.from("test"),
      };

      const req = mockRequest({}, { id: 1 }, mockFile);
      const res = mockResponse();

      const expectedResult = {
        message: "Profile photo uploaded successfully",
        profilePhotoUrl: "https://example.com/uploaded/profile.jpg",
      } as any;

      mockUserService.uploadProfilePhoto.mockResolvedValue(expectedResult);

      await userController.uploadProfilePhoto(req as Request, res as Response);

      expect(mockUserService.uploadProfilePhoto).toHaveBeenCalledWith(1, mockFile);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 400 when no file provided", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await userController.uploadProfilePhoto(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No file provided" });
      expect(mockUserService.uploadProfilePhoto).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", async () => {
      const mockFile = {
        fieldname: "photo",
        originalname: "profile.jpg",
      };

      const req = mockRequest({}, null, mockFile);
      const res = mockResponse();

      await userController.uploadProfilePhoto(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockUserService.uploadProfilePhoto).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const mockFile = {
        fieldname: "photo",
        originalname: "profile.jpg",
      };

      const req = mockRequest({}, { id: 1 }, mockFile);
      const res = mockResponse();

      const error = new Error("Upload failed");
      mockUserService.uploadProfilePhoto.mockRejectedValue(error);

      await expect(userController.uploadProfilePhoto(req as Request, res as Response)).rejects.toThrow("Upload failed");

      expect(mockUserService.uploadProfilePhoto).toHaveBeenCalledWith(1, mockFile);
    });

    it("should handle different file types", async () => {
      const mockFile = {
        fieldname: "photo",
        originalname: "profile.png",
        encoding: "7bit",
        mimetype: "image/png",
        size: 2048,
        destination: "/tmp",
        filename: "profile.png",
        path: "/tmp/profile.png",
        buffer: Buffer.from("test png"),
      };

      const req = mockRequest({}, { id: 1 }, mockFile);
      const res = mockResponse();

      const expectedResult = {
        message: "Profile photo uploaded successfully",
        profilePhotoUrl: "https://example.com/uploaded/profile.png",
      } as any;

      mockUserService.uploadProfilePhoto.mockResolvedValue(expectedResult);

      await userController.uploadProfilePhoto(req as Request, res as Response);

      expect(mockUserService.uploadProfilePhoto).toHaveBeenCalledWith(1, mockFile);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});
