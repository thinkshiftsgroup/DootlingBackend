import { Request, Response, NextFunction } from "express";
import { customerProtect } from "../customerAuth.middleware";
import * as jwt from "jsonwebtoken";
import { prisma } from "../../prisma";

jest.mock("../../prisma", () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock("jsonwebtoken");

const mockPrisma = prisma as any;
const mockJwt = jwt as any;

// Extend Request type to include customer property
interface AuthenticatedRequest extends Request {
  customer?: any;
}

describe("Customer Auth Middleware", () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      headers: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    
    nextFunction = jest.fn();
    
    // Mock environment variables - the middleware reads this directly
    process.env.JWT_SECRET = "test-secret";
  });

  describe("customerProtect", () => {
    it("should pass with valid customer token", async () => {
      const token = "valid-token";
      const decodedToken = { id: 1 };
      const mockCustomer = {
        id: 1,
        email: "customer@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer);

      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, "YOUR_UNSAFE_DEFAULT_SECRET");
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith({
        where: { id: Number(decodedToken.id) },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
      expect(mockRequest.customer).toEqual(mockCustomer);
      expect(nextFunction).toHaveBeenCalled();
    });

    it("should return 401 if no token provided", async () => {
      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Not authorized, no token",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if token format is invalid", async () => {
      mockRequest.headers = {
        authorization: "InvalidFormat token",
      };

      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Not authorized, no token",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if token verification fails", async () => {
      const token = "invalid-token";
      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      mockJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Not authorized, token failed",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if customer not found", async () => {
      const token = "valid-token";
      const decodedToken = { id: 1 };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockPrisma.customer.findUnique.mockResolvedValue(null);

      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Not authorized, customer not found",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("should return 401 if database error occurs", async () => {
      const token = "valid-token";
      const decodedToken = { id: 1 };

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      mockJwt.verify.mockReturnValue(decodedToken);
      mockPrisma.customer.findUnique.mockRejectedValue(new Error("Database error"));

      await customerProtect(mockRequest as AuthenticatedRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Not authorized, token failed",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
