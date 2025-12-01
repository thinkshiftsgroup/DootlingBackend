import { Request, Response } from "express";
import { customerService } from "@services/customer.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const customer = await customerService.createCustomer(storeId, req.body);
  res.status(201).json({ success: true, data: customer });
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, customerGroupId, page = "1", limit = "10" } = req.query;

  const customers = await customerService.getCustomers(storeId, {
    search: search as string,
    customerGroupId: customerGroupId ? parseInt(customerGroupId as string) : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: customers });
});

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const customer = await customerService.getCustomerById(id);
  res.status(200).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const customer = await customerService.updateCustomer(id, req.body);
  res.status(200).json({ success: true, data: customer });
});

export const deleteCustomer = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await customerService.deleteCustomer(id);
  res.status(200).json({ success: true, message: "Customer deleted successfully" });
});

export const getCustomerStats = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stats = await customerService.getCustomerStats(storeId);
  res.status(200).json({ success: true, data: stats });
});

export const exportCustomersCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const customers = await customerService.getAllCustomers(storeId);

  const fields = [
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "customerGroup.name",
    "shippingAddress",
    "shippingCity",
    "shippingCountry",
    "createdAt",
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(customers);

  res.header("Content-Type", "text/csv");
  res.attachment("customers.csv");
  res.send(csv);
});
