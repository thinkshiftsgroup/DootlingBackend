import { Request, Response } from "express";
import { invoiceService } from "@services/invoice.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const createInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = parseInt(req.params.storeId);
    const invoice = await invoiceService.createInvoice(storeId, {
      ...req.body,
      invoiceDate: new Date(req.body.invoiceDate),
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
    });
    res.status(201).json({ success: true, data: invoice });
  }
);

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const {
    search,
    warehouseId,
    customerId,
    status,
    minAmount,
    maxAmount,
    page = "1",
    limit = "10",
  } = req.query;

  const invoices = await invoiceService.getInvoices(storeId, {
    search: search as string,
    warehouseId: warehouseId ? parseInt(warehouseId as string) : undefined,
    customerId: customerId ? parseInt(customerId as string) : undefined,
    status: status as any,
    minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
    maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: invoices });
});

export const getAllInvoices = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = parseInt(req.params.storeId);
    const invoices = await invoiceService.getAllInvoices(storeId);
    res.status(200).json({ success: true, data: invoices });
  }
);

export const getInvoiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const storeId = req.store!.id;
    const invoice = await invoiceService.getInvoiceById(id, storeId);
    res.status(200).json({ success: true, data: invoice });
  }
);

export const updateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updateData = { ...req.body };
  if (req.body.invoiceDate) {
    updateData.invoiceDate = new Date(req.body.invoiceDate);
  }
  if (req.body.dueDate) {
    updateData.dueDate = new Date(req.body.dueDate);
  }
  const storeId = req.store!.id;
  const invoice = await invoiceService.updateInvoice(id, storeId, updateData);
  res.status(200).json({ success: true, data: invoice });
});

export const deleteInvoice = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const storeId = req.store!.id;
    await invoiceService.deleteInvoice(id, storeId);
    res
      .status(200)
      .json({ success: true, message: "Invoice deleted successfully" });
  }
);

export const exportInvoicesCSV = asyncHandler(
  async (req: Request, res: Response) => {
    const storeId = parseInt(req.params.storeId);
    const invoices = await invoiceService.getAllInvoices(storeId);

    const data = invoices.map((invoice: any) => ({
      invoiceNumber: invoice.invoiceNumber,
      warehouse: invoice.warehouse.name,
      biller: invoice.billerName,
      customer: invoice.customer
        ? `${invoice.customer.firstName} ${invoice.customer.lastName}`
        : "",
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      totalAmount: invoice.totalAmount,
      paidAmount: invoice.paidAmount,
      dueAmount: invoice.dueAmount,
      paymentMethod: invoice.paymentMethod,
      status: invoice.status,
      createdAt: invoice.createdAt,
    }));

    const fields = [
      "invoiceNumber",
      "warehouse",
      "biller",
      "customer",
      "invoiceDate",
      "dueDate",
      "totalAmount",
      "paidAmount",
      "dueAmount",
      "paymentMethod",
      "status",
      "createdAt",
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment("invoices.csv");
    res.send(csv);
  }
);
