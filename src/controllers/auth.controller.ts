import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { email, firstname, lastname, phone, howDidYouFindUs } = req.body;
  const result = await authService.register(email, firstname, lastname, phone, howDidYouFindUs);
  res.status(201).json(result);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const result = await authService.verifyEmail(email, code);
  res.status(200).json(result);
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.resendVerificationCode(email);
  res.status(200).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(result);
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json(result);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  res.status(200).json(result);
};

export const verifyResetCode = async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const result = await authService.verifyResetCode(email, code);
  res.status(200).json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, code, newPassword } = req.body;
  const result = await authService.resetPassword(email, code, newPassword);
  res.status(200).json(result);
};

export const logout = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const result = await authService.logout(Number(userId));
  res.status(200).json(result);
};

export const setPassword = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { password } = req.body;
  const result = await authService.setPassword(Number(userId), password);
  res.status(200).json(result);
};
