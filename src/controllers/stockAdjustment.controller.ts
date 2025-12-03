import { Request, Response } from "express";
import { stockAdjustmentService } from "@services/stockAdjustment.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";
import { AdjustmentType } from "@prisma/client";

export const createStockAdjustment = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const adjustment = await stockAdjustmentService.createStockAdjustment(storeId, {
    ...req.body,
    adjustmentDate: new Date(req.body.adjustmentDate),
  });
  res.status(201).json({ success: true, data: adjustment });
});

export const getStockAdjustments = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, warehouseId, productId, type, createdBy, page = "1", limit = "10" } = req.query;

  const adjustments = await stockAdjustmentService.getStockAdjustments(storeId, {
    search: search as string,
    warehouseId: warehouseId ? parseInt(warehouseId as string) : undefined,
    productId: productId ? parseInt(productId as string) : undefined,
    type: type as AdjustmentType,
    createdBy: createdBy as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: adjustments });
});

export const getAllStockAdjustments = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const adjustments = await stockAdjustmentService.getAllStockAdjustments(storeId);
  res.status(200).json({ success: true, data: adjustments });
});

export const getStockAdjustmentById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const adjustment = await stockAdjustmentService.getStockAdjustmentById(id, storeId);
  res.status(200).json({ success: true, data: adjustment });
});

export const updateStockAdjustment = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const updateData = { ...req.body };
  if (req.body.adjustmentDate) {
    updateData.adjustmentDate = new Date(req.body.adjustmentDate);
  }
  const adjustment = await stockAdjustmentService.updateStockAdjustment(id, storeId, updateData);
  res.status(200).json({ success: true, data: adjustment });
});

export const deleteStockAdjustment = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  await stockAdjustmentService.deleteStockAdjustment(id, storeId);
  res.status(200).json({ success: true, message: "Stock adjustment deleted successfully" });
});

export const exportStockAdjustmentsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const adjustments = await stockAdjustmentService.getAllStockAdjustments(storeId);

  const data = adjustments.map((adj) => ({
    id: adj.id,
    referenceNo: adj.referenceNo,
    warehouse: adj.warehouse.name,
    product: adj.product.name,
    adjustmentDate: adj.adjustmentDate,
    quantity: adj.quantity,
    type: adj.type,
    createdBy: adj.createdBy,
    notes: adj.notes,
    createdAt: adj.createdAt,
  }));

  const fields = [
    "id",
    "referenceNo",
    "warehouse",
    "product",
    "adjustmentDate",
    "quantity",
    "type",
    "createdBy",
    "notes",
    "createdAt",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("stock-adjustments.csv");
  res.send(csv);
});
