import { Request, Response } from "express";
import { productGroupService } from "@services/productGroup.service";
import { asyncHandler } from "@utils/asyncHandler";
import { uploadToCloudinary } from "@utils/cloudinary";
import { Parser } from "json2csv";

export const createProductGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const storeId = parseInt(req.params.storeId);
  const file = req.file;

  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const group = await productGroupService.createProductGroup(storeId, { name, description, imageUrl });
  res.status(201).json({ success: true, data: group });
});

export const getProductGroups = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, page = "1", limit = "10" } = req.query;

  const groups = await productGroupService.getProductGroups(storeId, {
    search: search as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: groups });
});

export const getProductGroupById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const group = await productGroupService.getProductGroupById(id);
  res.status(200).json({ success: true, data: group });
});

export const updateProductGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  const file = req.file;

  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const group = await productGroupService.updateProductGroup(id, { name, description, imageUrl });
  res.status(200).json({ success: true, data: group });
});

export const deleteProductGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await productGroupService.deleteProductGroup(id);
  res.status(200).json({ success: true, message: "Product group deleted successfully" });
});

export const exportProductGroupsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const groups = await productGroupService.getAllProductGroups(storeId);

  const fields = ["id", "name", "description", "imageUrl", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(groups);

  res.header("Content-Type", "text/csv");
  res.attachment("product-groups.csv");
  res.send(csv);
});
