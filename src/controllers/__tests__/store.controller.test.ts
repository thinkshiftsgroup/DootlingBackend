import { Request, Response } from "express";
import * as storeController from "../store.controller";
import * as storeService from "../../services/store.service";

// Mock dependencies
jest.mock("../../services/store.service");

const mockStoreService = storeService as jest.Mocked<typeof storeService>;

// Mock Express Request and Response
interface MockRequest extends Partial<Request> {
  user?: {
    id: number;
    email: string;
    username: string | null;
    isVerified: boolean;
    userType: string;
  };
}

const mockRequest = (body: any = {}, user: any = null): MockRequest => ({
  body,
  user,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Store Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setupStore", () => {
    it("should setup store successfully", async () => {
      const storeData = {
        businessName: "Test Store",
        storeUrl: "test-store.myshopify.com",
        country: "US",
        currency: "USD",
      };

      const req = mockRequest(storeData, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Store setup successful",
        store: {
          id: 1,
          businessName: "Test Store",
          storeUrl: "test-store.myshopify.com",
          country: "US",
          currency: "USD",
          isLaunched: false,
        },
      };

      mockStoreService.setupStore.mockResolvedValue(expectedResult);

      await storeController.setupStore(req as Request, res as Response);

      expect(mockStoreService.setupStore).toHaveBeenCalledWith(1, "Test Store", "test-store.myshopify.com", "US", "USD");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await storeController.setupStore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockStoreService.setupStore).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const storeData = {
        businessName: "Test Store",
        storeUrl: "test-store.myshopify.com",
        country: "US",
        currency: "USD",
      };

      const req = mockRequest(storeData, { id: 1 });
      const res = mockResponse();

      const error = new Error("Store setup failed");
      mockStoreService.setupStore.mockRejectedValue(error);

      await expect(storeController.setupStore(req as Request, res as Response)).rejects.toThrow("Store setup failed");

      expect(mockStoreService.setupStore).toHaveBeenCalledWith(1, "Test Store", "test-store.myshopify.com", "US", "USD");
    });
  });

  describe("getStore", () => {
    it("should get store successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        store: {
          id: 1,
          businessName: "Test Store",
          storeUrl: "test-store.myshopify.com",
          country: "US",
          currency: "USD",
          isLaunched: false,
          createdAt: new Date(),
        },
      };

      mockStoreService.getStore.mockResolvedValue(expectedResult);

      await storeController.getStore(req as Request, res as Response);

      expect(mockStoreService.getStore).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await storeController.getStore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockStoreService.getStore).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Store not found");
      mockStoreService.getStore.mockRejectedValue(error);

      await expect(storeController.getStore(req as Request, res as Response)).rejects.toThrow("Store not found");

      expect(mockStoreService.getStore).toHaveBeenCalledWith(1);
    });
  });

  describe("updateStore", () => {
    it("should update store successfully", async () => {
      const updateData = {
        businessName: "Updated Store",
        country: "CA",
        currency: "CAD",
      };

      const req = mockRequest(updateData, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Store updated successfully",
        store: {
          id: 1,
          businessName: "Updated Store",
          storeUrl: "test-store.myshopify.com",
          country: "CA",
          currency: "CAD",
          isLaunched: false,
        },
      };

      mockStoreService.updateStore.mockResolvedValue(expectedResult);

      await storeController.updateStore(req as Request, res as Response);

      expect(mockStoreService.updateStore).toHaveBeenCalledWith(1, "Updated Store", "CA", "CAD");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await storeController.updateStore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockStoreService.updateStore).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const updateData = {
        businessName: "Updated Store",
        country: "CA",
        currency: "CAD",
      };

      const req = mockRequest(updateData, { id: 1 });
      const res = mockResponse();

      const error = new Error("Update failed");
      mockStoreService.updateStore.mockRejectedValue(error);

      await expect(storeController.updateStore(req as Request, res as Response)).rejects.toThrow("Update failed");

      expect(mockStoreService.updateStore).toHaveBeenCalledWith(1, "Updated Store", "CA", "CAD");
    });
  });

  describe("launchStore", () => {
    it("should launch store successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Store launched successfully",
        store: {
          id: 1,
          businessName: "Test Store",
          storeUrl: "test-store.myshopify.com",
          country: "US",
          currency: "USD",
          isLaunched: true,
        },
      };

      mockStoreService.launchStore.mockResolvedValue(expectedResult);

      await storeController.launchStore(req as Request, res as Response);

      expect(mockStoreService.launchStore).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await storeController.launchStore(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockStoreService.launchStore).not.toHaveBeenCalled();
    });

    it("should handle service errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Launch failed");
      mockStoreService.launchStore.mockRejectedValue(error);

      await expect(storeController.launchStore(req as Request, res as Response)).rejects.toThrow("Launch failed");

      expect(mockStoreService.launchStore).toHaveBeenCalledWith(1);
    });
  });
});
