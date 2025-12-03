import { Request, Response } from "express";
import { brandService } from "@services/brand.service";
import { asyncHandler } from "@utils/asyncHandler";
import { uploadToCloudinary } from "@utils/cloudinary";
import { Parser } from "json2csv";

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const storeId = parseInt(req.params.storeId);
  const file = req.file;

  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const brand = await brandService.createBrand(storeId, { name, description, imageUrl });
  res.status(201).json({ success: true, data: brand });
});

export const getBrands = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, page = "1", limit = "10" } = req.query;

  const brands = await brandService.getBrands(storeId, {
    search: search as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: brands });
});

export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const brand = await brandService.getBrandById(id, storeId);
  res.status(200).json({ success: true, data: brand });
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  const file = req.file;

  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const storeId = req.store!.id;
  const brand = await brandService.updateBrand(id, storeId, { name, description, imageUrl });
  res.status(200).json({ success: true, data: brand });
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  await brandService.deleteBrand(id, storeId);
  res.status(200).json({ success: true, message: "Brand deleted successfully" });
});

export const exportBrandsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const brands = await brandService.getAllBrands(storeId);

  const fields = ["id", "name", "description", "imageUrl", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(brands);

  res.header("Content-Type", "text/csv");
  res.attachment("brands.csv");
  res.send(csv);
});
