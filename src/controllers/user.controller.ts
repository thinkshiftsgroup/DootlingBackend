import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await userService.getUserProfile(Number(userId));
  res.status(200).json(result);
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await userService.updateUserProfile(Number(userId), req.body);
  res.status(200).json(result);
};

export const uploadProfilePhoto = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "No file provided" });
    return;
  }

  const result = await userService.uploadProfilePhoto(Number(userId), req.file);
  res.status(200).json(result);
};
