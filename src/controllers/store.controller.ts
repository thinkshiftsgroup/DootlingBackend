import { Request, Response } from "express";
import * as storeService from "../services/store.service";

export const setupStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { businessName, storeUrl, country, currency } = req.body;
  const result = await storeService.setupStore(Number(userId), businessName, storeUrl, country, currency);
  res.status(201).json(result);
};

export const getStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const result = await storeService.getStore(Number(userId));
  res.status(200).json(result);
};

export const updateStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const { businessName, country, currency } = req.body;
  const result = await storeService.updateStore(Number(userId), businessName, country, currency);
  res.status(200).json(result);
};

export const launchStore = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const result = await storeService.launchStore(Number(userId));
  res.status(200).json(result);
};

export const getStorefrontByUrl = async (req: Request, res: Response) => {
  const { storeUrl } = req.params;
  if (!storeUrl) {
    res.status(400).json({ message: "Store URL is required" });
    return;
  }
  const result = await storeService.getStorefrontByUrl(storeUrl);
  res.status(200).json(result);
};
