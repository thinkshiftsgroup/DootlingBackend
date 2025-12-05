import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  refreshAccessToken,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  logout,
  setPassword,
} from "../auth.service";
import { prisma } from "../../prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { generateSixDigitCode } from "../../utils/codeGenerator";
import { sendVerificationCodeEmail, sendPasswordResetCodeEmail } from "../../utils/email";

// Mock dependencies
jest.mock("../../prisma");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../utils/codeGenerator");
jest.mock("../../utils/email");

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as any;
const mockBcrypt = bcrypt as any;
const mockJwt = jwt as any;
const mockGenerateSixDigitCode = generateSixDigitCode as jest.MockedFunction<typeof generateSixDigitCode>;
const mockSendVerificationCodeEmail = sendVerificationCodeEmail as jest.MockedFunction<typeof sendVerificationCodeEmail>;
const mockSendPasswordResetCodeEmail = sendPasswordResetCodeEmail as jest.MockedFunction<typeof sendPasswordResetCodeEmail>;

// Mock the prisma export
(prisma as any) = mockPrisma;

// Mock environment variables
const originalEnv = process.env;

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables to ensure they're properly set
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.ACCESS_TOKEN_EXPIRY;
    delete process.env.REFRESH_TOKEN_EXPIRY;
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      ACCESS_TOKEN_EXPIRY: "15m",
      REFRESH_TOKEN_EXPIRY: "7d",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("register", () => {
    it("should register user successfully", async () => {
      const userData = {
        email: "test@example.com",
        firstname: "John",
        lastname: "Doe",
        password: "password123",
        phone: "+1234567890",
        howDidYouFindUs: "Google",
        subscribeToMarketing: true,
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        fullName: "John Doe",
        firstname: "John",
        lastname: "Doe",
        phone: "+1234567890",
        howDidYouFindUs: "Google",
        username: "johndoe1234",
        subscribeToMarketing: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockGenerateSixDigitCode.mockReturnValue("123456");
      mockBcrypt.hash.mockResolvedValue("hashedPassword");
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSendVerificationCodeEmail.mockResolvedValue();

      const result = await register(
        userData.email,
        userData.firstname,
        userData.lastname,
        userData.password,
        userData.phone,
        userData.howDidYouFindUs,
        userData.subscribeToMarketing
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: "hashedPassword",
          fullName: "John Doe",
          firstname: "John",
          lastname: "Doe",
          phone: "+1234567890",
          howDidYouFindUs: "Google",
          username: expect.stringMatching(/^johndoe\d{4}$/),
          verificationCode: "123456",
          verificationCodeExpires: expect.any(Date),
          subscribeToMarketing: true,
        },
      });

      expect(mockSendVerificationCodeEmail).toHaveBeenCalledWith(
        "test@example.com",
        "123456",
        "John Doe"
      );

      expect(result).toEqual({
        message: "Registration successful. Please check your email for verification code.",
        userId: 1,
      });
    });

    it("should register user without optional fields", async () => {
      const userData = {
        email: "test@example.com",
        firstname: "Jane",
        lastname: "Smith",
        password: "password123",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        fullName: "Jane Smith",
        firstname: "Jane",
        lastname: "Smith",
        phone: undefined,
        howDidYouFindUs: undefined,
        username: "janesmith5678",
        subscribeToMarketing: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockGenerateSixDigitCode.mockReturnValue("654321");
      mockBcrypt.hash.mockResolvedValue("hashedPassword");
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSendVerificationCodeEmail.mockResolvedValue();

      const result = await register(
        userData.email,
        userData.firstname,
        userData.lastname,
        userData.password
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          password: "hashedPassword",
          fullName: "Jane Smith",
          firstname: "Jane",
          lastname: "Smith",
          phone: undefined,
          howDidYouFindUs: undefined,
          username: expect.any(String),
          verificationCode: "654321",
          verificationCodeExpires: expect.any(Date),
          subscribeToMarketing: false,
        },
      });

      expect(result).toEqual({
        message: "Registration successful. Please check your email for verification code.",
        userId: 1,
      });
    });

    it("should trim whitespace from input fields", async () => {
      const mockUser = { id: 1 };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockGenerateSixDigitCode.mockReturnValue("123456");
      mockBcrypt.hash.mockResolvedValue("hashedPassword");
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSendVerificationCodeEmail.mockResolvedValue();

      await register(
        "  test@example.com  ",
        "  John  ",
        "  Doe  ",
        "  password123  ",
        "  +1234567890  ",
        "  Google  ",
        true
      );

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "  test@example.com  ".toLowerCase(),
          firstname: "John",
          lastname: "Doe",
          phone: "+1234567890",
          howDidYouFindUs: "Google",
        }),
      });
    });

    it("should convert email to lowercase", async () => {
      const mockUser = { id: 1 };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockGenerateSixDigitCode.mockReturnValue("123456");
      mockBcrypt.hash.mockResolvedValue("hashedPassword");
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockSendVerificationCodeEmail.mockResolvedValue();

      await register("Test@Example.COM", "John", "Doe", "password123");

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "test@example.com",
        }),
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(register("", "John", "Doe", "password123")).rejects.toThrow("Email is required");
      await expect(register("   ", "John", "Doe", "password123")).rejects.toThrow("Email is required");
    });

    it("should throw error when firstname is empty", async () => {
      await expect(register("test@example.com", "", "Doe", "password123")).rejects.toThrow("First name is required");
      await expect(register("test@example.com", "   ", "Doe", "password123")).rejects.toThrow("First name is required");
    });

    it("should throw error when lastname is empty", async () => {
      await expect(register("test@example.com", "John", "", "password123")).rejects.toThrow("Last name is required");
      await expect(register("test@example.com", "John", "   ", "password123")).rejects.toThrow("Last name is required");
    });

    it("should throw error when password is empty", async () => {
      await expect(register("test@example.com", "John", "Doe", "")).rejects.toThrow("Password is required");
      await expect(register("test@example.com", "John", "Doe", "   ")).rejects.toThrow("Password is required");
    });

    it("should throw error when email format is invalid", async () => {
      await expect(register("invalid-email", "John", "Doe", "password123")).rejects.toThrow("Invalid email format");
      await expect(register("test@", "John", "Doe", "password123")).rejects.toThrow("Invalid email format");
      await expect(register("@example.com", "John", "Doe", "password123")).rejects.toThrow("Invalid email format");
    });

    it("should throw error when password is too short", async () => {
      await expect(register("test@example.com", "John", "Doe", "123")).rejects.toThrow("Password must be at least 8 characters long");
      await expect(register("test@example.com", "John", "Doe", "1234567")).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should throw error when email already exists", async () => {
      const existingUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(register("test@example.com", "John", "Doe", "password123")).rejects.toThrow("Email already registered");
    });
  });

  describe("verifyEmail", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      fullName: "John Doe",
      isVerified: false,
      verificationCode: "123456",
      verificationCodeExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    it("should verify email successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockJwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await verifyEmail("test@example.com", "123456");

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isVerified: true, verificationCode: null, verificationCodeExpires: null },
      });

      expect(mockJwt.sign).toHaveBeenCalledWith({ id: 1 }, expect.any(String), { expiresIn: "15m" });
      expect(mockJwt.sign).toHaveBeenCalledWith({ id: 1 }, expect.any(String), { expiresIn: "7d" });

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", isVerified: true },
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(verifyEmail("", "123456")).rejects.toThrow("Email is required");
      await expect(verifyEmail("   ", "123456")).rejects.toThrow("Email is required");
    });

    it("should throw error when verification code is empty", async () => {
      await expect(verifyEmail("test@example.com", "")).rejects.toThrow("Verification code is required");
      await expect(verifyEmail("test@example.com", "   ")).rejects.toThrow("Verification code is required");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(verifyEmail("test@example.com", "123456")).rejects.toThrow("User not found");
    });

    it("should throw error when email already verified", async () => {
      const verifiedUser = { ...mockUser, isVerified: true };
      mockPrisma.user.findUnique.mockResolvedValue(verifiedUser);

      await expect(verifyEmail("test@example.com", "123456")).rejects.toThrow("Email already verified");
    });

    it("should throw error when verification code is invalid", async () => {
      const userWithWrongCode = { ...mockUser, verificationCode: "654321" };
      mockPrisma.user.findUnique.mockResolvedValue(userWithWrongCode);

      await expect(verifyEmail("test@example.com", "123456")).rejects.toThrow("Invalid verification code");
    });

    it("should throw error when verification code is expired", async () => {
      const userWithExpiredCode = {
        ...mockUser,
        verificationCodeExpires: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithExpiredCode);

      await expect(verifyEmail("test@example.com", "123456")).rejects.toThrow("Verification code expired");
    });

    it("should trim verification code", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue("access-token");
      mockJwt.sign.mockReturnValue("refresh-token");

      await verifyEmail("test@example.com", "  123456  ");

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  describe("resendVerificationCode", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      fullName: "John Doe",
      isVerified: false,
    };

    it("should resend verification code successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockGenerateSixDigitCode.mockReturnValue("654321");
      mockSendVerificationCodeEmail.mockResolvedValue();

      const result = await resendVerificationCode("test@example.com");

      expect(mockGenerateSixDigitCode).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          verificationCode: "654321",
          verificationCodeExpires: expect.any(Date),
        },
      });

      expect(mockSendVerificationCodeEmail).toHaveBeenCalledWith(
        "test@example.com",
        "654321",
        "John Doe"
      );

      expect(result).toEqual({
        message: "Verification code resent successfully",
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(resendVerificationCode("")).rejects.toThrow("Email is required");
      await expect(resendVerificationCode("   ")).rejects.toThrow("Email is required");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(resendVerificationCode("test@example.com")).rejects.toThrow("User not found");
    });

    it("should throw error when email already verified", async () => {
      const verifiedUser = { ...mockUser, isVerified: true };
      mockPrisma.user.findUnique.mockResolvedValue(verifiedUser);

      await expect(resendVerificationCode("test@example.com")).rejects.toThrow("Email already verified");
    });
  });

  describe("login", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      fullName: "John Doe",
      username: "johndoe1234",
      password: "hashedPassword",
      isVerified: true,
      refreshToken: null,
      stores: [],
    };

    it("should login successfully without store", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockJwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await login("test@example.com", "password123");

      expect(mockBcrypt.compare).toHaveBeenCalledWith("password123", "hashedPassword");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: "refresh-token", lastActive: expect.any(Date) },
      });

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", username: "johndoe1234" },
        hasStore: false,
        store: null,
      });
    });

    it("should login successfully with store", async () => {
      const mockUserWithStore = {
        ...mockUser,
        stores: [{ id: 1, storeUrl: "test-store.myshop.com" }],
      };
      
      mockPrisma.user.findUnique.mockResolvedValue(mockUserWithStore);
      mockBcrypt.compare.mockResolvedValue(true);
      mockPrisma.user.update.mockResolvedValue(mockUserWithStore);
      mockJwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await login("test@example.com", "password123");

      expect(result).toEqual({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        user: { id: 1, email: "test@example.com", fullName: "John Doe", username: "johndoe1234" },
        hasStore: true,
        store: { storeId: 1, storeUrl: "test-store.myshop.com" },
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(login("", "password123")).rejects.toThrow("Email is required");
      await expect(login("   ", "password123")).rejects.toThrow("Email is required");
    });

    it("should throw error when password is empty", async () => {
      await expect(login("test@example.com", "")).rejects.toThrow("Password is required");
      await expect(login("test@example.com", "   ")).rejects.toThrow("Password is required");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login("test@example.com", "password123")).rejects.toThrow("Invalid credentials");
    });

    it("should throw error when password is invalid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(login("test@example.com", "wrongpassword")).rejects.toThrow("Invalid credentials");
    });

    it("should throw error when email not verified", async () => {
      const unverifiedUser = { ...mockUser, isVerified: false };
      mockPrisma.user.findUnique.mockResolvedValue(unverifiedUser);
      mockBcrypt.compare.mockResolvedValue(true);

      await expect(login("test@example.com", "password123")).rejects.toThrow("Please verify your email first");
    });
  });

  describe("refreshAccessToken", () => {
    const mockUser = {
      id: 1,
      refreshToken: "valid-refresh-token",
    };

    it("should refresh access token successfully", async () => {
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockJwt.sign.mockReturnValue("new-access-token");

      const result = await refreshAccessToken("valid-refresh-token");

      expect(mockJwt.verify).toHaveBeenCalledWith("valid-refresh-token", expect.any(String));
      expect(mockJwt.sign).toHaveBeenCalledWith({ id: 1 }, expect.any(String), { expiresIn: "15m" });

      expect(result).toEqual({ accessToken: "new-access-token" });
    });

    it("should throw error when refresh token is invalid", async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(refreshAccessToken("invalid-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should throw error when user not found", async () => {
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(refreshAccessToken("valid-refresh-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("should throw error when refresh token does not match", async () => {
      const userWithDifferentToken = { ...mockUser, refreshToken: "different-token" };
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockPrisma.user.findUnique.mockResolvedValue(userWithDifferentToken);

      await expect(refreshAccessToken("valid-refresh-token")).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("forgotPassword", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      fullName: "John Doe",
    };

    it("should send password reset code successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockGenerateSixDigitCode.mockReturnValue("987654");
      mockSendPasswordResetCodeEmail.mockResolvedValue();

      const result = await forgotPassword("test@example.com");

      expect(mockGenerateSixDigitCode).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          resetPasswordToken: "987654",
          resetPasswordExpires: expect.any(Date),
        },
      });

      expect(mockSendPasswordResetCodeEmail).toHaveBeenCalledWith(
        "test@example.com",
        "987654",
        "John Doe"
      );

      expect(result).toEqual({
        message: "Password reset code sent to your email",
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(forgotPassword("")).rejects.toThrow("Email is required");
      await expect(forgotPassword("   ")).rejects.toThrow("Email is required");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(forgotPassword("test@example.com")).rejects.toThrow("User not found");
    });
  });

  describe("verifyResetCode", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      resetPasswordToken: "123456",
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    it("should verify reset code successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await verifyResetCode("test@example.com", "123456");

      expect(result).toEqual({
        message: "Reset code verified",
        email: "test@example.com",
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(verifyResetCode("", "123456")).rejects.toThrow("Email is required");
      await expect(verifyResetCode("   ", "123456")).rejects.toThrow("Email is required");
    });

    it("should throw error when reset code is empty", async () => {
      await expect(verifyResetCode("test@example.com", "")).rejects.toThrow("Reset code is required");
      await expect(verifyResetCode("test@example.com", "   ")).rejects.toThrow("Reset code is required");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(verifyResetCode("test@example.com", "123456")).rejects.toThrow("User not found");
    });

    it("should throw error when reset code is invalid", async () => {
      const userWithWrongCode = { ...mockUser, resetPasswordToken: "654321" };
      mockPrisma.user.findUnique.mockResolvedValue(userWithWrongCode);

      await expect(verifyResetCode("test@example.com", "123456")).rejects.toThrow("Invalid reset code");
    });

    it("should throw error when reset code is expired", async () => {
      const userWithExpiredCode = {
        ...mockUser,
        resetPasswordExpires: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithExpiredCode);

      await expect(verifyResetCode("test@example.com", "123456")).rejects.toThrow("Reset code expired");
    });

    it("should trim reset code", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await verifyResetCode("test@example.com", "  123456  ");

      expect(mockPrisma.user.findUnique).toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      resetPasswordToken: "123456",
      resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    };

    it("should reset password successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue("newHashedPassword");

      const result = await resetPassword("test@example.com", "123456", "newPassword123");

      expect(mockBcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          password: "newHashedPassword",
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      expect(result).toEqual({
        message: "Password reset successful",
      });
    });

    it("should throw error when email is empty", async () => {
      await expect(resetPassword("", "123456", "newPassword123")).rejects.toThrow("Email is required");
      await expect(resetPassword("   ", "123456", "newPassword123")).rejects.toThrow("Email is required");
    });

    it("should throw error when reset code is empty", async () => {
      await expect(resetPassword("test@example.com", "", "newPassword123")).rejects.toThrow("Reset code is required");
      await expect(resetPassword("test@example.com", "   ", "newPassword123")).rejects.toThrow("Reset code is required");
    });

    it("should throw error when new password is empty", async () => {
      await expect(resetPassword("test@example.com", "123456", "")).rejects.toThrow("New password is required");
      await expect(resetPassword("test@example.com", "123456", "   ")).rejects.toThrow("New password is required");
    });

    it("should throw error when new password is too short", async () => {
      await expect(resetPassword("test@example.com", "123456", "123")).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(resetPassword("test@example.com", "123456", "newPassword123")).rejects.toThrow("User not found");
    });

    it("should throw error when reset code is invalid", async () => {
      const userWithWrongCode = { ...mockUser, resetPasswordToken: "654321" };
      mockPrisma.user.findUnique.mockResolvedValue(userWithWrongCode);

      await expect(resetPassword("test@example.com", "123456", "newPassword123")).rejects.toThrow("Invalid reset code");
    });

    it("should throw error when reset code is expired", async () => {
      const userWithExpiredCode = {
        ...mockUser,
        resetPasswordExpires: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithExpiredCode);

      await expect(resetPassword("test@example.com", "123456", "newPassword123")).rejects.toThrow("Reset code expired");
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      mockPrisma.user.update.mockResolvedValue({});

      const result = await logout(1);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: null },
      });

      expect(result).toEqual({
        message: "Logged out successfully",
      });
    });
  });

  describe("setPassword", () => {
    const mockUser = {
      id: 1,
    };

    it("should set password successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue("newHashedPassword");

      const result = await setPassword(1, "newPassword123");

      expect(mockBcrypt.hash).toHaveBeenCalledWith("newPassword123", 10);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: "newHashedPassword" },
      });

      expect(result).toEqual({
        message: "Password changed successfully",
      });
    });

    it("should throw error when password is empty", async () => {
      await expect(setPassword(1, "")).rejects.toThrow("Password is required");
      await expect(setPassword(1, "   ")).rejects.toThrow("Password is required");
    });

    it("should throw error when password is too short", async () => {
      await expect(setPassword(1, "123")).rejects.toThrow("Password must be at least 8 characters long");
    });

    it("should throw error when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(setPassword(1, "newPassword123")).rejects.toThrow("User not found");
    });
  });
});
