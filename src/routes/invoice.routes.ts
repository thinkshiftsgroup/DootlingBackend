import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as invoiceController from "@controllers/invoice.controller";

export const invoiceRouter = Router();

invoiceRouter.post("/:storeId", authenticate, verifyStoreAccess, invoiceController.createInvoice);
invoiceRouter.get(
  "/:storeId/export",
  authenticate,
  verifyStoreAccess,
  invoiceController.exportInvoicesCSV
);
invoiceRouter.get(
  "/:storeId/all",
  authenticate,
  verifyStoreAccess,
  invoiceController.getAllInvoices
);
invoiceRouter.get(
  "/:storeId/:id",
  authenticate,
  verifyStoreAccess,
  invoiceController.getInvoiceById
);
invoiceRouter.get("/:storeId", authenticate, verifyStoreAccess, invoiceController.getInvoices);
invoiceRouter.put("/:id", authenticate, verifyResourceOwnership("invoice"), invoiceController.updateInvoice);
invoiceRouter.delete("/:id", authenticate, verifyResourceOwnership("invoice"), invoiceController.deleteInvoice);
