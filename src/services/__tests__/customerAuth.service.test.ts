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
  updateProfile,
} from "../customerAuth.service";
import { prisma } from "../../prisma";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { generateSixDigitCode } from "../../utils/codeGenerator";
import { sendVerificationCodeEmail, sendPasswordResetCodeEmail } from "../../utils/email";

jest.mock("../../prisma");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("../../utils/codeGenerator");
jest.mock("../../utils/email");

const mockPrisma = {
  customer: {
    findFirst: jest.fn(),
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

(prisma as any) = mockPrisma;

const originalEnv = process.env;

describe("Customer Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      JWT_SECRET: "test-secret",
      JWT_REFRESH_SECRET: "test-refresh-secret",
      ACCESS_TOKEN_EXPIRY: "15m",
      REFRESH_TOKEN_EXPIRY: "7d",
    } as any;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const storeId = 99;

  describe("register", () => {
    it("registers customer and sends OTP", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      mockGenerateSixDigitCode.mockReturnValue("123456");
      mockBcrypt.hash.mockResolvedValue("hashed");
      mockPrisma.customer.create.mockResolvedValue({ id: 1 });
      mockSendVerificationCodeEmail.mockResolvedValue();

      const res = await register(storeId, "c@test.com", "Jane", "Doe", "password123");

      expect(mockPrisma.customer.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          storeId,
          email: "c@test.com",
          firstName: "Jane",
          lastName: "Doe",
          password: "hashed",
          verificationCode: "123456",
        }),
      });
      expect(mockSendVerificationCodeEmail).toHaveBeenCalledWith("c@test.com", "123456", "Jane Doe");
      expect(res).toEqual({ message: expect.any(String), customerId: 1 });
    });

    it("throws when email already exists", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1 });
      await expect(register(storeId, "c@test.com", "Jane", "Doe", "password123")).rejects.toThrow("Email already registered");
    });

    it("validates inputs", async () => {
      await expect(register(storeId, "", "Jane", "Doe", "password123")).rejects.toThrow("Email is required");
      await expect(register(storeId, "test", "Jane", "Doe", "password123")).rejects.toThrow("Invalid email format");
      await expect(register(storeId, "c@test.com", "", "Doe", "password123")).rejects.toThrow("First name is required");
      await expect(register(storeId, "c@test.com", "Jane", "", "password123")).rejects.toThrow("Last name is required");
      await expect(register(storeId, "c@test.com", "Jane", "Doe", "short")).rejects.toThrow("Password must be at least 8 characters long");
    });
  });

  describe("verifyEmail", () => {
    const base = { id: 1, email: "c@test.com", isVerified: false, verificationCode: "123456", verificationCodeExpires: new Date(Date.now() + 60000) };

    it("verifies and returns tokens", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(base);
      mockPrisma.customer.update.mockResolvedValue(base);
      mockJwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const res = await verifyEmail(storeId, "c@test.com", "123456");
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { isVerified: true, verificationCode: null, verificationCodeExpires: null } });
      expect(res).toEqual({ accessToken: "access-token", refreshToken: "refresh-token", customer: expect.objectContaining({ id: 1, email: "c@test.com", isVerified: true }) });
    });

    it("fails for invalid/expired codes", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ ...base, verificationCode: "000000" });
      await expect(verifyEmail(storeId, "c@test.com", "123456")).rejects.toThrow("Invalid verification code");

      mockPrisma.customer.findFirst.mockResolvedValue({ ...base, verificationCodeExpires: new Date(Date.now() - 1000) });
      await expect(verifyEmail(storeId, "c@test.com", "123456")).rejects.toThrow("Verification code expired");
    });
  });

  describe("resendVerificationCode", () => {
    it("resends OTP if not verified", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, email: "c@test.com", firstName: "Jane", lastName: "Doe", isVerified: false });
      mockGenerateSixDigitCode.mockReturnValue("654321");
      mockPrisma.customer.update.mockResolvedValue({});

      const res = await resendVerificationCode(storeId, "c@test.com");
      expect(mockPrisma.customer.update).toHaveBeenCalled();
      expect(mockSendVerificationCodeEmail).toHaveBeenCalledWith("c@test.com", "654321", "Jane Doe");
      expect(res).toEqual({ message: expect.any(String) });
    });
  });

  describe("login", () => {
    it("logs in verified customer", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, email: "c@test.com", password: "hashed", isVerified: true, firstName: "Jane", lastName: "Doe" });
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const res = await login(storeId, "c@test.com", "password123");
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { refreshToken: "refresh-token", lastActive: expect.any(Date) } });
      expect(res).toEqual({ accessToken: "access-token", refreshToken: "refresh-token", customer: expect.objectContaining({ id: 1, email: "c@test.com" }) });
    });

    it("rejects invalid credentials or unverified", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue(null);
      await expect(login(storeId, "c@test.com", "password123")).rejects.toThrow("Invalid credentials");

      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, email: "c@test.com", password: "hashed", isVerified: true });
      mockBcrypt.compare.mockResolvedValue(false);
      await expect(login(storeId, "c@test.com", "bad" )).rejects.toThrow("Invalid credentials");

      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, email: "c@test.com", password: "hashed", isVerified: false });
      mockBcrypt.compare.mockResolvedValue(true);
      await expect(login(storeId, "c@test.com", "password123" )).rejects.toThrow("Please verify your email first");
    });
  });

  describe("refreshAccessToken", () => {
    it("refreshes token", async () => {
      mockJwt.verify.mockReturnValue({ id: 1 });
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1, refreshToken: "valid" });
      mockJwt.sign.mockReturnValue("new-access");
      const res = await refreshAccessToken("valid");
      expect(res).toEqual({ accessToken: "new-access" });
    });

    it("rejects invalid token", async () => {
      mockJwt.verify.mockImplementation(() => { throw new Error("bad"); });
      await expect(refreshAccessToken("bad")).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("forgot/reset password", () => {
    it("sends reset code and resets password", async () => {
      mockPrisma.customer.findFirst.mockResolvedValue({ id: 1, email: "c@test.com", firstName: "Jane", lastName: "Doe", resetPasswordToken: "123456", resetPasswordExpires: new Date(Date.now() + 60000) });
      mockGenerateSixDigitCode.mockReturnValue("123456");
      mockPrisma.customer.update.mockResolvedValue({});
      mockSendPasswordResetCodeEmail.mockResolvedValue();

      const fr = await forgotPassword(storeId, "c@test.com");
      expect(fr).toEqual({ message: expect.any(String) });

      const vr = await verifyResetCode(storeId, "c@test.com", "123456");
      expect(vr).toEqual({ message: "Reset code verified", email: "c@test.com" });

      (mockPrisma.customer.findFirst as any).mockResolvedValue({ id: 1, email: "c@test.com", resetPasswordToken: "123456", resetPasswordExpires: new Date(Date.now() + 60000) });
      mockBcrypt.hash.mockResolvedValue("new-hash");
      const rr = await resetPassword(storeId, "c@test.com", "123456", "password123");
      expect(rr).toEqual({ message: "Password reset successful" });
    });
  });

  describe("logout", () => {
    it("clears refresh token", async () => {
      mockPrisma.customer.update.mockResolvedValue({});
      const res = await logout(1);
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({ where: { id: 1 }, data: { refreshToken: null } });
      expect(res).toEqual({ message: "Logged out successfully" });
    });
  });

  describe("updateProfile", () => {
    it("updates profile fields for same store", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1, storeId });
      mockPrisma.customer.update.mockResolvedValue({ id: 1, storeId, phone: "+123" });
      const res = await updateProfile(storeId, 1, { phone: "+123", shippingCity: "NY" });
      expect(mockPrisma.customer.update).toHaveBeenCalledWith({ where: { id: 1 }, data: expect.objectContaining({ phone: "+123", shippingCity: "NY" }) });
      expect(res).toEqual({ message: "Profile updated", customer: expect.objectContaining({ id: 1 }) });
    });

    it("rejects when store mismatch", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue({ id: 1, storeId: 1 });
      await expect(updateProfile(storeId, 1, { phone: "+123" })).rejects.toThrow("Customer not found");
    });
  });
});
