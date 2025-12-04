import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadSingleImage } from "@middlewares/upload.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as productGroupController from "@controllers/productGroup.controller";

export const productGroupRouter = Router();

productGroupRouter.post("/:storeId", authenticate, verifyStoreAccess, uploadSingleImage, productGroupController.createProductGroup);
productGroupRouter.get("/:storeId/export", authenticate, verifyStoreAccess, productGroupController.exportProductGroupsCSV);
productGroupRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, productGroupController.getProductGroupById);
productGroupRouter.get("/:storeId", authenticate, verifyStoreAccess, productGroupController.getProductGroups);
productGroupRouter.put("/:id", authenticate, verifyResourceOwnership("productGroup"), uploadSingleImage, productGroupController.updateProductGroup);
productGroupRouter.delete("/:id", authenticate, verifyResourceOwnership("productGroup"), productGroupController.deleteProductGroup);
