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

  const { name, supplierId, notes, isActive } = req.body;

  const supplier = await supplierService.createSupplier(storeId, {
    name,
    supplierId,
    notes,
    isActive: isActive !== undefined ? isActive : true,
    imageUrl,
    emails: req.body.emails ? (typeof req.body.emails === 'string' ? JSON.parse(req.body.emails) : req.body.emails) : undefined,
    phones: req.body.phones ? (typeof req.body.phones === 'string' ? JSON.parse(req.body.phones) : req.body.phones) : undefined,
    addresses: req.body.addresses ? (typeof req.body.addresses === 'string' ? JSON.parse(req.body.addresses) : req.body.addresses) : undefined,
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

  const { name, supplierId, notes, isActive } = req.body;
  const updateData: any = {};
  
  if (name !== undefined) updateData.name = name;
  if (supplierId !== undefined) updateData.supplierId = supplierId;
  if (notes !== undefined) updateData.notes = notes;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (imageUrl) updateData.imageUrl = imageUrl;
  if (req.body.emails) updateData.emails = typeof req.body.emails === 'string' ? JSON.parse(req.body.emails) : req.body.emails;
  if (req.body.phones) updateData.phones = typeof req.body.phones === 'string' ? JSON.parse(req.body.phones) : req.body.phones;
  if (req.body.addresses) updateData.addresses = typeof req.body.addresses === 'string' ? JSON.parse(req.body.addresses) : req.body.addresses;

  const supplier = await supplierService.updateSupplier(id, updateData);
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

  const data = suppliers.map((supplier: any) => ({
    id: supplier.id,
    name: supplier.name,
    supplierId: supplier.supplierId,
    emails: supplier.emails.map((e: any) => `${e.email} (${e.type})`).join("; "),
    phones: supplier.phones.map((p: any) => `${p.phone} (${p.type})`).join("; "),
    addresses: supplier.addresses.map((a: any) => `${a.title ? a.title + ": " : ""}${a.address}, ${a.city}`).join("; "),
    isActive: supplier.isActive,
    createdAt: supplier.createdAt,
  }));

  const fields = ["id", "name", "supplierId", "emails", "phones", "addresses", "isActive", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("suppliers.csv");
  res.send(csv);
});
