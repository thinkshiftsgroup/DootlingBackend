import { Request, Response } from "express";
import { warehouseService } from "@services/warehouse.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const warehouse = await warehouseService.createWarehouse(storeId, req.body);
  res.status(201).json({ success: true, data: warehouse });
});

export const getWarehouses = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, isActive, page = "1", limit = "10" } = req.query;

  const warehouses = await warehouseService.getWarehouses(storeId, {
    search: search as string,
    isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: warehouses });
});

export const getAllWarehouses = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const warehouses = await warehouseService.getAllWarehouses(storeId);
  res.status(200).json({ success: true, data: warehouses });
});

export const getWarehouseById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const warehouse = await warehouseService.getWarehouseById(id);
  res.status(200).json({ success: true, data: warehouse });
});

export const updateWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const warehouse = await warehouseService.updateWarehouse(id, req.body);
  res.status(200).json({ success: true, data: warehouse });
});

export const deleteWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await warehouseService.deleteWarehouse(id);
  res.status(200).json({ success: true, message: "Warehouse deleted successfully" });
});

export const exportWarehousesCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const warehouses = await warehouseService.getAllWarehouses(storeId);

  const fields = ["id", "name", "address", "city", "state", "country", "phone", "isActive", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(warehouses);

  res.header("Content-Type", "text/csv");
  res.attachment("warehouses.csv");
  res.send(csv);
});
