import { Request, Response } from "express";
import * as kycController from "../kyc.controller";
import * as kycService from "../../services/kyc.service";

// Mock dependencies
jest.mock("../../services/kyc.service");

const mockKycService = kycService as jest.Mocked<typeof kycService>;

// Mock Express Request and Response
interface MockRequest extends Partial<Request> {
  user?: {
    id: number;
    email: string;
    username: string | null;
    isVerified: boolean;
    userType: string;
  };
  files?: { [fieldname: string]: Express.Multer.File[] };
  file?: Express.Multer.File;
}

const mockRequest = (body: any = {}, user: any = null, files: any = null, file: any = null): MockRequest => ({
  body,
  user,
  files,
  file,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("KYC Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getPersonalKyc", () => {
    it("should get personal KYC successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        id: 1,
        userId: 1,
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        countryOfResidency: "US",
        contactAddress: "123 Main St",
        occupation: "Developer",
        employmentStatus: "Employed",
        annualIncome: "50000-75000",
        sourceOfFunds: "Employment",
        politicalExposure: false,
        kycStatus: "NOT_STARTED",
      } as any;

      mockKycService.getPersonalKyc.mockResolvedValue(expectedResult);

      await kycController.getPersonalKyc(req as Request, res as Response);

      expect(mockKycService.getPersonalKyc).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.getPersonalKyc(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.getPersonalKyc).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Service error");
      mockKycService.getPersonalKyc.mockRejectedValue(error);

      await expect(kycController.getPersonalKyc(req as Request, res as Response)).rejects.toThrow("Service error");

      expect(mockKycService.getPersonalKyc).toHaveBeenCalledWith(1);
    });
  });

  describe("updatePersonalKyc", () => {
    it("should update personal KYC successfully", async () => {
      const kycData = {
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1990-01-01",
        countryOfResidency: "US",
        contactAddress: "123 Main St",
        occupation: "Developer",
        employmentStatus: "Employed",
        annualIncome: "50000-75000",
        sourceOfFunds: "Employment",
        politicalExposure: false,
      };

      const req = mockRequest(kycData, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Personal KYC profile created",
        profile: {
          id: 1,
          userId: 1,
          firstName: "John",
          lastName: "Doe",
          dateOfBirth: "1990-01-01",
          countryOfResidency: "US",
          contactAddress: "123 Main St",
          occupation: "Developer",
          employmentStatus: "Employed",
          annualIncome: "50000-75000",
          sourceOfFunds: "Employment",
          politicalExposure: false,
          kycStatus: "IN_PROGRESS",
        },
      } as any;

      mockKycService.upsertPersonalKyc.mockResolvedValue(expectedResult);

      await kycController.updatePersonalKyc(req as Request, res as Response);

      expect(mockKycService.upsertPersonalKyc).toHaveBeenCalledWith(1, kycData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        id: 1,
        userId: 1,
        kycStatus: "IN_PROGRESS",
      } as any;

      mockKycService.upsertPersonalKyc.mockResolvedValue(expectedResult);

      await kycController.updatePersonalKyc(req as Request, res as Response);

      expect(mockKycService.upsertPersonalKyc).toHaveBeenCalledWith(1, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.updatePersonalKyc(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.upsertPersonalKyc).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({ firstName: "John" }, { id: 1 });
      const res = mockResponse();

      const error = new Error("Validation error");
      mockKycService.upsertPersonalKyc.mockRejectedValue(error);

      await expect(kycController.updatePersonalKyc(req as Request, res as Response)).rejects.toThrow("Validation error");

      expect(mockKycService.upsertPersonalKyc).toHaveBeenCalledWith(1, { firstName: "John" });
    });
  });

  describe("getBusinessKyc", () => {
    it("should get business KYC successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        profile: {
          id: 1,
          userId: 1,
          businessName: "Test Business",
          companyType: "CORPORATE",
          incorporationNumber: "123456",
          dateOfIncorporation: new Date("2020-01-01"),
          businessAddress: "456 Business Ave",
          businessNature: "Technology",
          annualRevenue: "100000-500000",
          companyWebsite: null,
          countryOfIncorporation: null,
          taxNumber: null,
          companyAddress: null,
          zipOrPostcode: null,
          city: null,
          state: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      mockKycService.getBusinessKyc.mockResolvedValue(expectedResult);

      await kycController.getBusinessKyc(req as Request, res as Response);

      expect(mockKycService.getBusinessKyc).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.getBusinessKyc(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.getBusinessKyc).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Service error");
      mockKycService.getBusinessKyc.mockRejectedValue(error);

      await expect(kycController.getBusinessKyc(req as Request, res as Response)).rejects.toThrow("Service error");

      expect(mockKycService.getBusinessKyc).toHaveBeenCalledWith(1);
    });
  });

  describe("updateBusinessKyc", () => {
    it("should update business KYC successfully", async () => {
      const kycData = {
        businessName: "Test Business",
        businessType: "CORPORATE",
        dateOfIncorporation: "2020-01-01",
        registrationNumber: "123456",
        countryOfIncorporation: "US",
        businessAddress: "456 Business Ave",
        natureOfBusiness: "Technology",
        annualRevenue: "100000-500000",
      };

      const req = mockRequest(kycData, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Business KYC created",
        profile: {
          id: 1,
          userId: 1,
          businessName: "Test Business",
          companyType: "CORPORATE",
          incorporationNumber: "123456",
          dateOfIncorporation: new Date("2020-01-01"),
          businessAddress: "456 Business Ave",
          businessNature: "Technology",
          annualRevenue: "100000-500000",
          companyWebsite: null,
          countryOfIncorporation: null,
          taxNumber: null,
          companyAddress: null,
          zipOrPostcode: null,
          city: null,
          state: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      mockKycService.upsertBusinessKyc.mockResolvedValue(expectedResult);

      await kycController.updateBusinessKyc(req as Request, res as Response);

      expect(mockKycService.upsertBusinessKyc).toHaveBeenCalledWith(1, kycData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Business KYC updated",
        profile: {
          id: 1,
          userId: 1,
          businessName: null,
          companyType: null,
          incorporationNumber: null,
          dateOfIncorporation: null,
          businessAddress: null,
          businessNature: null,
          annualRevenue: null,
          companyWebsite: null,
          countryOfIncorporation: null,
          taxNumber: null,
          companyAddress: null,
          zipOrPostcode: null,
          city: null,
          state: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      mockKycService.upsertBusinessKyc.mockResolvedValue(expectedResult);

      await kycController.updateBusinessKyc(req as Request, res as Response);

      expect(mockKycService.upsertBusinessKyc).toHaveBeenCalledWith(1, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.updateBusinessKyc(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.upsertBusinessKyc).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({ businessName: "Test" }, { id: 1 });
      const res = mockResponse();

      const error = new Error("Validation error");
      mockKycService.upsertBusinessKyc.mockRejectedValue(error);

      await expect(kycController.updateBusinessKyc(req as Request, res as Response)).rejects.toThrow("Validation error");

      expect(mockKycService.upsertBusinessKyc).toHaveBeenCalledWith(1, { businessName: "Test" });
    });
  });

  describe("getDocuments", () => {
    it("should get KYC documents successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        documents: [
          {
            id: 1,
            userId: 1,
            type: "GOVERNMENT_ID" as any,
            url: "https://example.com/id.jpg",
            uploadedAt: new Date(),
          },
          {
            id: 2,
            userId: 1,
            type: "PROOF_OF_ADDRESS" as any,
            url: "https://example.com/address.pdf",
            uploadedAt: new Date(),
          },
        ],
      };

      mockKycService.listKycDocuments.mockResolvedValue(expectedResult);

      await kycController.getDocuments(req as Request, res as Response);

      expect(mockKycService.listKycDocuments).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.getDocuments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.listKycDocuments).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Service error");
      mockKycService.listKycDocuments.mockRejectedValue(error);

      await expect(kycController.getDocuments(req as Request, res as Response)).rejects.toThrow("Service error");

      expect(mockKycService.listKycDocuments).toHaveBeenCalledWith(1);
    });
  });

  describe("saveDocuments", () => {
    it("should save KYC documents successfully", async () => {
      const documents = [
        { type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" },
        { type: "PROOF_OF_ADDRESS", url: "https://example.com/address.pdf" },
      ];

      const req = mockRequest({ documents }, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "KYC documents saved",
        count: 2,
      };

      mockKycService.saveKycDocuments.mockResolvedValue(expectedResult);

      await kycController.saveDocuments(req as Request, res as Response);

      expect(mockKycService.saveKycDocuments).toHaveBeenCalledWith(1, documents);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing documents", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "KYC documents saved",
        count: 0,
      };

      mockKycService.saveKycDocuments.mockResolvedValue(expectedResult);

      await kycController.saveDocuments(req as Request, res as Response);

      expect(mockKycService.saveKycDocuments).toHaveBeenCalledWith(1, []);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.saveDocuments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.saveKycDocuments).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const documents = [{ type: "GOVERNMENT_ID", url: "https://example.com/id.jpg" }];
      const req = mockRequest({ documents }, { id: 1 });
      const res = mockResponse();

      const error = new Error("Validation error");
      mockKycService.saveKycDocuments.mockRejectedValue(error);

      await expect(kycController.saveDocuments(req as Request, res as Response)).rejects.toThrow("Validation error");

      expect(mockKycService.saveKycDocuments).toHaveBeenCalledWith(1, documents);
    });
  });

  describe("uploadDocuments", () => {
    it("should upload KYC documents successfully", async () => {
      const files = {
        governmentId: [{
          fieldname: "governmentId",
          originalname: "id.jpg",
          encoding: "7bit",
          mimetype: "image/jpeg",
          size: 1024,
          destination: "/tmp",
          filename: "id.jpg",
          path: "/tmp/id.jpg",
          buffer: Buffer.from("test"),
        }],
      };

      const req = mockRequest({}, { id: 1 }, files);
      const res = mockResponse();

      const expectedResult = {
        message: "Documents uploaded successfully",
        count: 1,
        documents: [
          {
            type: "GOVERNMENT_ID" as any,
            url: "https://example.com/uploaded/id.jpg",
          },
        ],
      };

      mockKycService.uploadKycDocuments.mockResolvedValue(expectedResult);

      await kycController.uploadDocuments(req as Request, res as Response);

      expect(mockKycService.uploadKycDocuments).toHaveBeenCalledWith(1, files);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 400 when no files provided", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      await kycController.uploadDocuments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "No files provided" });
      expect(mockKycService.uploadKycDocuments).not.toHaveBeenCalled();
    });

    it("should return 401 when user is not authenticated", async () => {
      const files = { governmentId: [{}] };
      const req = mockRequest({}, null, files);
      const res = mockResponse();

      await kycController.uploadDocuments(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.uploadKycDocuments).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const files = { governmentId: [{}] };
      const req = mockRequest({}, { id: 1 }, files);
      const res = mockResponse();

      const error = new Error("Upload error");
      mockKycService.uploadKycDocuments.mockRejectedValue(error);

      await expect(kycController.uploadDocuments(req as Request, res as Response)).rejects.toThrow("Upload error");

      expect(mockKycService.uploadKycDocuments).toHaveBeenCalledWith(1, files);
    });
  });

  describe("submitKyc", () => {
    it("should submit KYC successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "KYC submitted for approval",
        profile: {
          id: 1,
          userId: 1,
          status: "SUBMITTED" as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      } as any;

      mockKycService.submitKyc.mockResolvedValue(expectedResult);

      await kycController.submitKyc(req as Request, res as Response);

      expect(mockKycService.submitKyc).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.submitKyc(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.submitKyc).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Submission error");
      mockKycService.submitKyc.mockRejectedValue(error);

      await expect(kycController.submitKyc(req as Request, res as Response)).rejects.toThrow("Submission error");

      expect(mockKycService.submitKyc).toHaveBeenCalledWith(1);
    });
  });

  describe("getPeps", () => {
    it("should get PEPs successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        peps: [
          {
            id: 1,
            userId: 1,
            name: "John Doe",
            position: "CEO",
            organization: "Test Corp",
            relationship: "Business Partner",
            createdAt: new Date(),
          },
        ],
      };

      mockKycService.listPeps.mockResolvedValue(expectedResult);

      await kycController.getPeps(req as Request, res as Response);

      expect(mockKycService.listPeps).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.getPeps(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.listPeps).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Service error");
      mockKycService.listPeps.mockRejectedValue(error);

      await expect(kycController.getPeps(req as Request, res as Response)).rejects.toThrow("Service error");

      expect(mockKycService.listPeps).toHaveBeenCalledWith(1);
    });
  });

  describe("savePeps", () => {
    it("should save PEPs successfully", async () => {
      const peps = [
        {
          name: "John Doe",
          position: "CEO",
          organization: "Test Corp",
          relationship: "Business Partner",
        },
        {
          name: "Jane Smith",
          position: "Director",
          organization: "Another Corp",
          relationship: "Family Member",
        },
      ];

      const req = mockRequest({ peps }, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "PEPs saved successfully",
        count: 2,
      };

      mockKycService.savePeps.mockResolvedValue(expectedResult);

      await kycController.savePeps(req as Request, res as Response);

      expect(mockKycService.savePeps).toHaveBeenCalledWith(1, peps);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing PEPs", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "PEPs saved successfully",
        count: 0,
      };

      mockKycService.savePeps.mockResolvedValue(expectedResult);

      await kycController.savePeps(req as Request, res as Response);

      expect(mockKycService.savePeps).toHaveBeenCalledWith(1, []);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await kycController.savePeps(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockKycService.savePeps).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const peps = [{ name: "John Doe", position: "CEO" }];
      const req = mockRequest({ peps }, { id: 1 });
      const res = mockResponse();

      const error = new Error("Validation error");
      mockKycService.savePeps.mockRejectedValue(error);

      await expect(kycController.savePeps(req as Request, res as Response)).rejects.toThrow("Validation error");

      expect(mockKycService.savePeps).toHaveBeenCalledWith(1, peps);
    });
  });
});
