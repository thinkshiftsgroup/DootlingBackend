import { Request, Response } from "express";
import * as customerController from "../customerAuth.controller";
import * as customerService from "../../services/customerAuth.service";

jest.mock("../../services/customerAuth.service");

const mockService = customerService as jest.Mocked<typeof customerService>;

type AnyReq = Partial<Request> & { store?: any; customer?: any } & { [k: string]: any };

const mockRequest = (body: any = {}, storeId?: number, customer?: any): AnyReq => ({
  body,
  store: storeId ? { 
    id: storeId,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 1,
    businessName: "Test Store",
    storeUrl: "test-store",
    country: "US",
    currency: "USD",
    isLaunched: true
  } : undefined,
  customer,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Customer Auth Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const storeId = 99;

  it("register", async () => {
    const req = mockRequest({ email: "c@test.com", firstName: "Jane", lastName: "Doe", password: "password123" }, storeId);
    const res = mockResponse();
    mockService.register.mockResolvedValue({ message: "ok", customerId: 1 });
    await customerController.register(req as Request, res as Response);
    expect(mockService.register).toHaveBeenCalledWith(storeId, "c@test.com", "Jane", "Doe", "password123");
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("verifyEmail", async () => {
    const req = mockRequest({ email: "c@test.com", code: "123456" }, storeId);
    const res = mockResponse();
    mockService.verifyEmail.mockResolvedValue({ accessToken: "a", refreshToken: "r", customer: { id: 1 } } as any);
    await customerController.verifyEmail(req as Request, res as Response);
    expect(mockService.verifyEmail).toHaveBeenCalledWith(storeId, "c@test.com", "123456");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("resendVerificationCode", async () => {
    const req = mockRequest({ email: "c@test.com" }, storeId);
    const res = mockResponse();
    mockService.resendVerificationCode.mockResolvedValue({ message: "sent" });
    await customerController.resendVerificationCode(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("login", async () => {
    const req = mockRequest({ email: "c@test.com", password: "password123" }, storeId);
    const res = mockResponse();
    mockService.login.mockResolvedValue({ accessToken: "a", refreshToken: "r", customer: { id: 1 } } as any);
    await customerController.login(req as Request, res as Response);
    expect(mockService.login).toHaveBeenCalledWith(storeId, "c@test.com", "password123");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("refreshToken", async () => {
    const req = mockRequest({ refreshToken: "rt" }, undefined);
    const res = mockResponse();
    mockService.refreshAccessToken.mockResolvedValue({ accessToken: "na" });
    await customerController.refreshToken(req as Request, res as Response);
    expect(mockService.refreshAccessToken).toHaveBeenCalledWith("rt");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("forgotPassword", async () => {
    const req = mockRequest({ email: "c@test.com" }, storeId);
    const res = mockResponse();
    mockService.forgotPassword.mockResolvedValue({ message: "ok" });
    await customerController.forgotPassword(req as Request, res as Response);
    expect(mockService.forgotPassword).toHaveBeenCalledWith(storeId, "c@test.com");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("verifyResetCode", async () => {
    const req = mockRequest({ email: "c@test.com", code: "123456" }, storeId);
    const res = mockResponse();
    mockService.verifyResetCode.mockResolvedValue({ message: "Reset code verified", email: "c@test.com" });
    await customerController.verifyResetCode(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("resetPassword", async () => {
    const req = mockRequest({ email: "c@test.com", code: "123456", newPassword: "password123" }, storeId);
    const res = mockResponse();
    mockService.resetPassword.mockResolvedValue({ message: "Password reset successful" });
    await customerController.resetPassword(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("logout - unauthorized", async () => {
    const req = mockRequest({}, storeId);
    const res = mockResponse();
    await customerController.logout(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("logout - success", async () => {
    const req = mockRequest({}, storeId, { id: 1 });
    const res = mockResponse();
    mockService.logout.mockResolvedValue({ message: "Logged out successfully" });
    await customerController.logout(req as Request, res as Response);
    expect(mockService.logout).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("updateProfile - unauthorized", async () => {
    const req = mockRequest({ phone: "+123" }, storeId);
    const res = mockResponse();
    await customerController.updateProfile(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("updateProfile - success", async () => {
    const req = mockRequest({ phone: "+123" }, storeId, { id: 1 });
    const res = mockResponse();
    mockService.updateProfile.mockResolvedValue({ message: "Profile updated", customer: { id: 1 } } as any);
    await customerController.updateProfile(req as Request, res as Response);
    expect(mockService.updateProfile).toHaveBeenCalledWith(storeId, 1, { phone: "+123" });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
