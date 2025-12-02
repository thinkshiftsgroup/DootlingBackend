import { Request, Response } from "express";
import * as customerAuth from "../services/customerAuth.service";

export const register = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email, firstName, lastName, password } = req.body || {};
  const result = await customerAuth.register(Number(storeId), email, firstName, lastName, password);
  res.status(201).json(result);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email, code } = req.body || {};
  const result = await customerAuth.verifyEmail(Number(storeId), email, code);
  res.status(200).json(result);
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email } = req.body || {};
  const result = await customerAuth.resendVerificationCode(Number(storeId), email);
  res.status(200).json(result);
};

export const login = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email, password } = req.body || {};
  const result = await customerAuth.login(Number(storeId), email, password);
  res.status(200).json(result);
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body || {};
  const result = await customerAuth.refreshAccessToken(refreshToken);
  res.status(200).json(result);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email } = req.body || {};
  const result = await customerAuth.forgotPassword(Number(storeId), email);
  res.status(200).json(result);
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email, code } = req.body || {};
  const result = await customerAuth.verifyResetCode(Number(storeId), email, code);
  res.status(200).json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const { email, code, newPassword } = req.body || {};
  const result = await customerAuth.resetPassword(Number(storeId), email, code, newPassword);
  res.status(200).json(result);
};

export const logout = async (req: Request, res: Response) => {
  const customerId = (req as any).customer?.id as number;
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const result = await customerAuth.logout(Number(customerId));
  res.status(200).json(result);
};

export const updateProfile = async (req: Request, res: Response) => {
  const storeId = req.store?.id as number;
  const customerId = (req as any).customer?.id as number;
  if (!customerId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const result = await customerAuth.updateProfile(Number(storeId), Number(customerId), req.body || {});
  res.status(200).json(result);
};
