import { Request, Response } from "express";
import { internalTransferService } from "@services/internalTransfer.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";
import { TransferStatus } from "@prisma/client";

export const createInternalTransfer = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const transfer = await internalTransferService.createInternalTransfer(storeId, {
    ...req.body,
    transferDate: new Date(req.body.transferDate),
  });
  res.status(201).json({ success: true, data: transfer });
});

export const getInternalTransfers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, fromWarehouseId, toWarehouseId, status, page = "1", limit = "10" } = req.query;

  const transfers = await internalTransferService.getInternalTransfers(storeId, {
    search: search as string,
    fromWarehouseId: fromWarehouseId ? parseInt(fromWarehouseId as string) : undefined,
    toWarehouseId: toWarehouseId ? parseInt(toWarehouseId as string) : undefined,
    status: status as TransferStatus,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: transfers });
});

export const getAllInternalTransfers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const transfers = await internalTransferService.getAllInternalTransfers(storeId);
  res.status(200).json({ success: true, data: transfers });
});

export const getInternalTransferById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const transfer = await internalTransferService.getInternalTransferById(id, storeId);
  res.status(200).json({ success: true, data: transfer });
});

export const updateInternalTransfer = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const updateData = { ...req.body };
  if (req.body.transferDate) {
    updateData.transferDate = new Date(req.body.transferDate);
  }
  const transfer = await internalTransferService.updateInternalTransfer(id, storeId, updateData);
  res.status(200).json({ success: true, data: transfer });
});

export const deleteInternalTransfer = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  await internalTransferService.deleteInternalTransfer(id, storeId);
  res.status(200).json({ success: true, message: "Internal transfer deleted successfully" });
});

export const exportInternalTransfersCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const transfers = await internalTransferService.getAllInternalTransfers(storeId);

  const data = transfers.map((transfer) => ({
    id: transfer.id,
    referenceNo: transfer.referenceNo,
    fromWarehouse: transfer.fromWarehouse.name,
    toWarehouse: transfer.toWarehouse.name,
    product: transfer.product.name,
    transferDate: transfer.transferDate,
    quantity: transfer.quantity,
    costForTransfer: transfer.costForTransfer,
    status: transfer.status,
    createdAt: transfer.createdAt,
  }));

  const fields = [
    "id",
    "referenceNo",
    "fromWarehouse",
    "toWarehouse",
    "product",
    "transferDate",
    "quantity",
    "costForTransfer",
    "status",
    "createdAt",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("internal-transfers.csv");
  res.send(csv);
});
