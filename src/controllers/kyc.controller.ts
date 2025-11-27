import { Request, Response } from "express";
import * as kycService from "../services/kyc.service";

export const getPersonalKyc = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.getPersonalKyc(Number(userId));
  res.status(200).json(result);
};

export const updatePersonalKyc = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.upsertPersonalKyc(Number(userId), req.body || {});
  res.status(200).json(result);
};

export const getBusinessKyc = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.getBusinessKyc(Number(userId));
  res.status(200).json(result);
};

export const updateBusinessKyc = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.upsertBusinessKyc(Number(userId), req.body || {});
  res.status(200).json(result);
};

export const getDocuments = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.listKycDocuments(Number(userId));
  res.status(200).json(result);
};

export const saveDocuments = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { documents } = req.body || {};
  const result = await kycService.saveKycDocuments(Number(userId), documents || []);
  res.status(200).json(result);
};

export const uploadDocuments = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  if (!files || Object.keys(files).length === 0) {
    res.status(400).json({ message: "No files provided" });
    return;
  }

  const result = await kycService.uploadKycDocuments(Number(userId), files);
  res.status(200).json(result);
};

export const submitKyc = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.submitKyc(Number(userId));
  res.status(200).json(result);
};

export const getPeps = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const result = await kycService.listPeps(Number(userId));
  res.status(200).json(result);
};

export const savePeps = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { peps } = req.body || {};
  const result = await kycService.savePeps(Number(userId), peps || []);
  res.status(200).json(result);
};
