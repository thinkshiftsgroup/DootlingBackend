import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadSingle } from "@middlewares/upload.middleware";
import * as productGroupController from "@controllers/productGroup.controller";

export const productGroupRouter = Router();

productGroupRouter.post("/:storeId", authenticate, uploadSingle, productGroupController.createProductGroup);
productGroupRouter.get("/:storeId", authenticate, productGroupController.getProductGroups);
productGroupRouter.get("/:storeId/export", authenticate, productGroupController.exportProductGroupsCSV);
productGroupRouter.get("/:storeId/:id", authenticate, productGroupController.getProductGroupById);
productGroupRouter.put("/:id", authenticate, uploadSingle, productGroupController.updateProductGroup);
productGroupRouter.delete("/:id", authenticate, productGroupController.deleteProductGroup);
