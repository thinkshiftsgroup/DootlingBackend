import { Request, Response } from "express";
import { productVariantService } from "@services/productVariant.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const { name, hasMultipleOptions, options } = req.body;
  const storeId = parseInt(req.params.storeId);

  const variant = await productVariantService.createProductVariant(storeId, {
    name,
    hasMultipleOptions: hasMultipleOptions || false,
    options: options || [],
  });

  res.status(201).json({ success: true, data: variant });
});

export const getProductVariants = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, page = "1", limit = "10" } = req.query;

  const variants = await productVariantService.getProductVariants(storeId, {
    search: search as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: variants });
});

export const getProductVariantById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const variant = await productVariantService.getProductVariantById(id);
  res.status(200).json({ success: true, data: variant });
});

export const updateProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, hasMultipleOptions, options } = req.body;

  const variant = await productVariantService.updateProductVariant(id, {
    name,
    hasMultipleOptions,
    options,
  });

  res.status(200).json({ success: true, data: variant });
});

export const deleteProductVariant = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await productVariantService.deleteProductVariant(id);
  res.status(200).json({ success: true, message: "Product variant deleted successfully" });
});

export const exportProductVariantsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const variants = await productVariantService.getAllProductVariants(storeId);

  const csvData = variants.map((v) => ({
    id: v.id,
    name: v.name,
    hasMultipleOptions: v.hasMultipleOptions,
    options: v.options.map((o) => o.name).join(", "),
    createdAt: v.createdAt,
  }));

  const fields = ["id", "name", "hasMultipleOptions", "options", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(csvData);

  res.header("Content-Type", "text/csv");
  res.attachment("product-variants.csv");
  res.send(csv);
});
