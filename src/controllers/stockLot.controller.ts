import { Request, Response } from "express";
import { stockLotService } from "@services/stockLot.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";
import { PurchaseStatus } from "@prisma/client";

export const createStockLot = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stockLot = await stockLotService.createStockLot(storeId, {
    ...req.body,
    purchaseDate: new Date(req.body.purchaseDate),
  });
  res.status(201).json({ success: true, data: stockLot });
});

export const getStockLots = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, warehouseId, supplierId, status, page = "1", limit = "10" } = req.query;

  const stockLots = await stockLotService.getStockLots(storeId, {
    search: search as string,
    warehouseId: warehouseId ? parseInt(warehouseId as string) : undefined,
    supplierId: supplierId ? parseInt(supplierId as string) : undefined,
    status: status as PurchaseStatus,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: stockLots });
});

export const getAllStockLots = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stockLots = await stockLotService.getAllStockLots(storeId);
  res.status(200).json({ success: true, data: stockLots });
});

export const getStockLotById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const stockLot = await stockLotService.getStockLotById(id, storeId);
  res.status(200).json({ success: true, data: stockLot });
});

export const updateStockLot = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const updateData = { ...req.body };
  if (req.body.purchaseDate) {
    updateData.purchaseDate = new Date(req.body.purchaseDate);
  }
  const stockLot = await stockLotService.updateStockLot(id, storeId, updateData);
  res.status(200).json({ success: true, data: stockLot });
});

export const deleteStockLot = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  await stockLotService.deleteStockLot(id, storeId);
  res.status(200).json({ success: true, message: "Stock lot deleted successfully" });
});

export const importStockLotsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { lots } = req.body;

  const results = await stockLotService.importStockLots(storeId, lots);
  res.status(200).json({ success: true, data: results });
});

export const exportStockLotsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stockLots = await stockLotService.getAllStockLots(storeId);

  const data = stockLots.map((lot) => ({
    id: lot.id,
    lotReferenceNo: lot.lotReferenceNo,
    warehouse: lot.warehouse.name,
    supplier: lot.supplier.name,
    product: lot.product.name,
    purchaseDate: lot.purchaseDate,
    quantity: lot.quantity,
    purchasePrice: lot.purchasePrice,
    otherCharges: lot.otherCharges,
    discount: lot.discount,
    status: lot.status,
    createdAt: lot.createdAt,
  }));

  const fields = [
    "id",
    "lotReferenceNo",
    "warehouse",
    "supplier",
    "product",
    "purchaseDate",
    "quantity",
    "purchasePrice",
    "otherCharges",
    "discount",
    "status",
    "createdAt",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("stock-lots.csv");
  res.send(csv);
});
