import { Request, Response } from "express";
import { supplierService } from "@services/supplier.service";
import { asyncHandler } from "@utils/asyncHandler";
import { uploadToCloudinary } from "@utils/cloudinary";
import { Parser } from "json2csv";

export const createSupplier = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const file = req.file;
  
  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const supplier = await supplierService.createSupplier(storeId, {
    ...req.body,
    imageUrl,
    emails: req.body.emails ? JSON.parse(req.body.emails) : undefined,
    phones: req.body.phones ? JSON.parse(req.body.phones) : undefined,
    addresses: req.body.addresses ? JSON.parse(req.body.addresses) : undefined,
  });
  res.status(201).json({ success: true, data: supplier });
});

export const getSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, isActive, page = "1", limit = "10" } = req.query;

  const suppliers = await supplierService.getSuppliers(storeId, {
    search: search as string,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: suppliers });
});

export const getAllSuppliers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const suppliers = await supplierService.getAllSuppliers(storeId);
  res.status(200).json({ success: true, data: suppliers });
});

export const getSupplierById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const supplier = await supplierService.getSupplierById(id);
  res.status(200).json({ success: true, data: supplier });
});

export const updateSupplier = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const file = req.file;
  
  let imageUrl: string | undefined;
  if (file) {
    imageUrl = await uploadToCloudinary(file, "image");
  }

  const supplier = await supplierService.updateSupplier(id, {
    ...req.body,
    ...(imageUrl && { imageUrl }),
    emails: req.body.emails ? JSON.parse(req.body.emails) : undefined,
    phones: req.body.phones ? JSON.parse(req.body.phones) : undefined,
    addresses: req.body.addresses ? JSON.parse(req.body.addresses) : undefined,
  });
  res.status(200).json({ success: true, data: supplier });
});

export const deleteSupplier = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await supplierService.deleteSupplier(id);
  res.status(200).json({ success: true, message: "Supplier deleted successfully" });
});

export const exportSuppliersCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const suppliers = await supplierService.getAllSuppliers(storeId);

  const fields = ["id", "name", "email", "phone", "contactPerson", "address", "city", "isActive", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(suppliers);

  res.header("Content-Type", "text/csv");
  res.attachment("suppliers.csv");
  res.send(csv);
});
