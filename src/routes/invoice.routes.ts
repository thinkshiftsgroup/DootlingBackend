import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as invoiceController from "@controllers/invoice.controller";

export const invoiceRouter = Router();

invoiceRouter.post("/:storeId", authenticate, invoiceController.createInvoice);
invoiceRouter.get("/:storeId/export", authenticate, invoiceController.exportInvoicesCSV);
invoiceRouter.get("/:storeId/all", authenticate, invoiceController.getAllInvoices);
invoiceRouter.get("/:storeId/:id", authenticate, invoiceController.getInvoiceById);
invoiceRouter.get("/:storeId", authenticate, invoiceController.getInvoices);
invoiceRouter.put("/:id", authenticate, invoiceController.updateInvoice);
invoiceRouter.delete("/:id", authenticate, invoiceController.deleteInvoice);
