import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import { uploadSingle } from "@middlewares/upload.middleware";
import * as supplierController from "@controllers/supplier.controller";

export const supplierRouter = Router();

supplierRouter.post("/:storeId", authenticate, verifyStoreAccess, uploadSingle, supplierController.createSupplier);
supplierRouter.get("/:storeId/export", authenticate, verifyStoreAccess, supplierController.exportSuppliersCSV);
supplierRouter.get("/:storeId/all", authenticate, verifyStoreAccess, supplierController.getAllSuppliers);
supplierRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, supplierController.getSupplierById);
supplierRouter.get("/:storeId", authenticate, verifyStoreAccess, supplierController.getSuppliers);
supplierRouter.put("/:id", authenticate, verifyResourceOwnership("supplier"), uploadSingle, supplierController.updateSupplier);
supplierRouter.delete("/:id", authenticate, verifyResourceOwnership("supplier"), supplierController.deleteSupplier);
