import { Request, Response } from "express";
import { unitService } from "@services/unit.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createUnit = asyncHandler(async (req: Request, res: Response) => {
  const { name, status } = req.body;
  const storeId = parseInt(req.params.storeId);

  const unit = await unitService.createUnit(storeId, { name, status });
  res.status(201).json({ success: true, data: unit });
});

export const getUnits = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, status, page = "1", limit = "10" } = req.query;

  const units = await unitService.getUnits(storeId, {
    search: search as string,
    status: status as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: units });
});

export const getUnitById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const unit = await unitService.getUnitById(id);
  res.status(200).json({ success: true, data: unit });
});

export const updateUnit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, status } = req.body;

  const unit = await unitService.updateUnit(id, { name, status });
  res.status(200).json({ success: true, data: unit });
});

export const deleteUnit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await unitService.deleteUnit(id);
  res.status(200).json({ success: true, message: "Unit deleted successfully" });
});

export const exportUnitsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const units = await unitService.getAllUnits(storeId);

  const fields = ["id", "name", "status", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(units);

  res.header("Content-Type", "text/csv");
  res.attachment("units.csv");
  res.send(csv);
});