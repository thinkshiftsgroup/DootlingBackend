import { Request, Response } from "express";
import * as authController from "../auth.controller";
import * as authService from "../../services/auth.service";

// Mock dependencies
jest.mock("../../services/auth.service");

const mockAuthService = authService as jest.Mocked<typeof authService>;

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

describe("Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        phone: "+1234567890",
        howDidYouFindUs: "Google",
        subscribeToMarketing: true,
      });
      const res = mockResponse();

      const expectedResult = {
        message: "Registration successful. Please check your email for verification code.",
        userId: 1,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      await authController.register(req as Request, res as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        "test@example.com",
        "John",
        "Doe",
        "password123",
        "+1234567890",
        "Google",
        true
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        message: "Registration successful. Please check your email for verification code.",
        userId: 1,
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      await authController.register(req as Request, res as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle registration errors", async () => {
      const req = mockRequest({
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
      });
      const res = mockResponse();

      const error = new Error("Email already registered");
      mockAuthService.register.mockRejectedValue(error);

      // The controller doesn't handle errors, so we expect the promise to reject
      await expect(authController.register(req as Request, res as Response)).rejects.toThrow("Email already registered");

      expect(mockAuthService.register).toHaveBeenCalledWith(
        "test@example.com",
        "John",
        "Doe",
        "password123",
        undefined,
        undefined,
        undefined
      );
    });
  });

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "123456",
      });
      const res = mockResponse();

      const expectedResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", isVerified: true },
      };

      mockAuthService.verifyEmail.mockResolvedValue(expectedResult);

      await authController.verifyEmail(req as Request, res as Response);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith("test@example.com", "123456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", isVerified: true },
      };

      mockAuthService.verifyEmail.mockResolvedValue(expectedResult);

      await authController.verifyEmail(req as Request, res as Response);

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle verification errors", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "wrong-code",
      });
      const res = mockResponse();

      const error = new Error("Invalid verification code");
      mockAuthService.verifyEmail.mockRejectedValue(error);

      await expect(authController.verifyEmail(req as Request, res as Response)).rejects.toThrow("Invalid verification code");

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith("test@example.com", "wrong-code");
    });
  });

  describe("resendVerificationCode", () => {
    it("should resend verification code successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
      });
      const res = mockResponse();

      const expectedResult = {
        message: "Verification code resent successfully",
      };

      mockAuthService.resendVerificationCode.mockResolvedValue(expectedResult);

      await authController.resendVerificationCode(req as Request, res as Response);

      expect(mockAuthService.resendVerificationCode).toHaveBeenCalledWith("test@example.com");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        message: "Verification code resent successfully",
      };

      mockAuthService.resendVerificationCode.mockResolvedValue(expectedResult);

      await authController.resendVerificationCode(req as Request, res as Response);

      expect(mockAuthService.resendVerificationCode).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle resend errors", async () => {
      const req = mockRequest({
        email: "nonexistent@example.com",
      });
      const res = mockResponse();

      const error = new Error("User not found");
      mockAuthService.resendVerificationCode.mockRejectedValue(error);

      await expect(authController.resendVerificationCode(req as Request, res as Response)).rejects.toThrow("User not found");

      expect(mockAuthService.resendVerificationCode).toHaveBeenCalledWith("nonexistent@example.com");
    });
  });

  describe("login", () => {
    it("should login successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });
      const res = mockResponse();

      const expectedResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", username: "johndoe1234" },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      await authController.login(req as Request, res as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith("test@example.com", "password123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", username: "johndoe1234" },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      await authController.login(req as Request, res as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle login errors", async () => {
      const req = mockRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });
      const res = mockResponse();

      const error = new Error("Invalid credentials");
      mockAuthService.login.mockRejectedValue(error);

      await expect(authController.login(req as Request, res as Response)).rejects.toThrow("Invalid credentials");

      expect(mockAuthService.login).toHaveBeenCalledWith("test@example.com", "wrongpassword");
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const req = mockRequest({
        refreshToken: "valid-refresh-token",
      });
      const res = mockResponse();

      const expectedResult = {
        accessToken: "new-access-token",
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(expectedResult);

      await authController.refreshToken(req as Request, res as Response);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith("valid-refresh-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        accessToken: "new-access-token",
      };

      mockAuthService.refreshAccessToken.mockResolvedValue(expectedResult);

      await authController.refreshToken(req as Request, res as Response);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle refresh token errors", async () => {
      const req = mockRequest({
        refreshToken: "invalid-token",
      });
      const res = mockResponse();

      const error = new Error("Invalid or expired refresh token");
      mockAuthService.refreshAccessToken.mockRejectedValue(error);

      await expect(authController.refreshToken(req as Request, res as Response)).rejects.toThrow("Invalid or expired refresh token");

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith("invalid-token");
    });
  });

  describe("forgotPassword", () => {
    it("should send password reset code successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
      });
      const res = mockResponse();

      const expectedResult = {
        message: "Password reset code sent to your email",
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      await authController.forgotPassword(req as Request, res as Response);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith("test@example.com");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        message: "Password reset code sent to your email",
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResult);

      await authController.forgotPassword(req as Request, res as Response);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle forgot password errors", async () => {
      const req = mockRequest({
        email: "nonexistent@example.com",
      });
      const res = mockResponse();

      const error = new Error("User not found");
      mockAuthService.forgotPassword.mockRejectedValue(error);

      await expect(authController.forgotPassword(req as Request, res as Response)).rejects.toThrow("User not found");

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith("nonexistent@example.com");
    });
  });

  describe("verifyResetCode", () => {
    it("should verify reset code successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "123456",
      });
      const res = mockResponse();

      const expectedResult = {
        message: "Reset code verified",
        email: "test@example.com",
      };

      mockAuthService.verifyResetCode.mockResolvedValue(expectedResult);

      await authController.verifyResetCode(req as Request, res as Response);

      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith("test@example.com", "123456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        message: "Reset code verified",
        email: "test@example.com",
      };

      mockAuthService.verifyResetCode.mockResolvedValue(expectedResult);

      await authController.verifyResetCode(req as Request, res as Response);

      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith(undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle verify reset code errors", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "wrong-code",
      });
      const res = mockResponse();

      const error = new Error("Invalid reset code");
      mockAuthService.verifyResetCode.mockRejectedValue(error);

      await expect(authController.verifyResetCode(req as Request, res as Response)).rejects.toThrow("Invalid reset code");

      expect(mockAuthService.verifyResetCode).toHaveBeenCalledWith("test@example.com", "wrong-code");
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "123456",
        newPassword: "newPassword123",
      });
      const res = mockResponse();

      const expectedResult = {
        message: "Password reset successful",
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      await authController.resetPassword(req as Request, res as Response);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith("test@example.com", "123456", "newPassword123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle missing request body", async () => {
      const req = mockRequest();
      const res = mockResponse();

      const expectedResult = {
        message: "Password reset successful",
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResult);

      await authController.resetPassword(req as Request, res as Response);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(undefined, undefined, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle reset password errors", async () => {
      const req = mockRequest({
        email: "test@example.com",
        code: "wrong-code",
        newPassword: "newPassword123",
      });
      const res = mockResponse();

      const error = new Error("Invalid reset code");
      mockAuthService.resetPassword.mockRejectedValue(error);

      await expect(authController.resetPassword(req as Request, res as Response)).rejects.toThrow("Invalid reset code");

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith("test@example.com", "wrong-code", "newPassword123");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Logged out successfully",
      };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      await authController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.logout(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockAuthService.logout).not.toHaveBeenCalled();
    });

    it("should handle logout errors", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const error = new Error("Logout failed");
      mockAuthService.logout.mockRejectedValue(error);

      await expect(authController.logout(req as Request, res as Response)).rejects.toThrow("Logout failed");

      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
    });

    it("should handle string userId", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      const expectedResult = {
        message: "Logged out successfully",
      };

      mockAuthService.logout.mockResolvedValue(expectedResult);

      await authController.logout(req as Request, res as Response);

      expect(mockAuthService.logout).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });

  describe("setPassword", () => {
    it("should set password successfully", async () => {
      const req = mockRequest({ password: "newPassword123" }, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Password changed successfully",
      };

      mockAuthService.setPassword.mockResolvedValue(expectedResult);

      await authController.setPassword(req as Request, res as Response);

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(1, "newPassword123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should return 401 when user is not authenticated", async () => {
      const req = mockRequest({ password: "newPassword123" });
      const res = mockResponse();

      await authController.setPassword(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockAuthService.setPassword).not.toHaveBeenCalled();
    });

    it("should handle missing request body", async () => {
      const req = mockRequest({}, { id: 1 });
      const res = mockResponse();

      const expectedResult = {
        message: "Password changed successfully",
      };

      mockAuthService.setPassword.mockResolvedValue(expectedResult);

      await authController.setPassword(req as Request, res as Response);

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(1, undefined);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });

    it("should handle set password errors", async () => {
      const req = mockRequest({ password: "newPassword123" }, { id: 1 });
      const res = mockResponse();

      const error = new Error("Password too short");
      mockAuthService.setPassword.mockRejectedValue(error);

      await expect(authController.setPassword(req as Request, res as Response)).rejects.toThrow("Password too short");

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(1, "newPassword123");
    });

    it("should handle string userId", async () => {
      const req = mockRequest({ password: "newPassword123" }, { id: "1" });
      const res = mockResponse();

      const expectedResult = {
        message: "Password changed successfully",
      };

      mockAuthService.setPassword.mockResolvedValue(expectedResult);

      await authController.setPassword(req as Request, res as Response);

      expect(mockAuthService.setPassword).toHaveBeenCalledWith(1, "newPassword123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedResult);
    });
  });
});
