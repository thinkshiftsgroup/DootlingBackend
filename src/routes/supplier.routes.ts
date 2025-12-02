import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as supplierController from "@controllers/supplier.controller";

export const supplierRouter = Router();

import { uploadSingle } from "@middlewares/upload.middleware";

supplierRouter.post("/:storeId", authenticate, uploadSingle, supplierController.createSupplier);
supplierRouter.get("/:storeId/export", authenticate, supplierController.exportSuppliersCSV);
supplierRouter.get("/:storeId/all", authenticate, supplierController.getAllSuppliers);
supplierRouter.get("/:storeId/:id", authenticate, supplierController.getSupplierById);
supplierRouter.get("/:storeId", authenticate, supplierController.getSuppliers);
supplierRouter.put("/:id", authenticate, uploadSingle, supplierController.updateSupplier);
supplierRouter.delete("/:id", authenticate, supplierController.deleteSupplier);
