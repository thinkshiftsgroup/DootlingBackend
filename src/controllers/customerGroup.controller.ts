import { Request, Response } from "express";
import { customerGroupService } from "@services/customerGroup.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createCustomerGroup = asyncHandler(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const storeId = parseInt(req.params.storeId);

  const customerGroup = await customerGroupService.createCustomerGroup(storeId, { name, description });
  res.status(201).json({ success: true, data: customerGroup });
});

export const getCustomerGroups = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, page = "1", limit = "10" } = req.query;

  const customerGroups = await customerGroupService.getCustomerGroups(storeId, {
    search: search as string,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: customerGroups });
});

export const getCustomerGroupById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const customerGroup = await customerGroupService.getCustomerGroupById(id, storeId);
  res.status(200).json({ success: true, data: customerGroup });
});

export const updateCustomerGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  const { name, description } = req.body;

  const customerGroup = await customerGroupService.updateCustomerGroup(id, storeId, { name, description });
  res.status(200).json({ success: true, data: customerGroup });
});

export const deleteCustomerGroup = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const storeId = req.store!.id;
  await customerGroupService.deleteCustomerGroup(id, storeId);
  res.status(200).json({ success: true, message: "Customer group deleted successfully" });
});

export const exportCustomerGroupsCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const customerGroups = await customerGroupService.getAllCustomerGroups(storeId);

  const fields = ["id", "name", "description", "_count.customers", "createdAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(customerGroups);

  res.header("Content-Type", "text/csv");
  res.attachment("customer-groups.csv");
  res.send(csv);
});
