import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as productVariantController from "@controllers/productVariant.controller";

export const productVariantRouter = Router();

productVariantRouter.post("/:storeId", authenticate, verifyStoreAccess, productVariantController.createProductVariant);
productVariantRouter.get("/:storeId/export", authenticate, verifyStoreAccess, productVariantController.exportProductVariantsCSV);
productVariantRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, productVariantController.getProductVariantById);
productVariantRouter.get("/:storeId", authenticate, verifyStoreAccess, productVariantController.getProductVariants);
productVariantRouter.put("/:id", authenticate, verifyResourceOwnership("productVariant"), productVariantController.updateProductVariant);
productVariantRouter.delete("/:id", authenticate, verifyResourceOwnership("productVariant"), productVariantController.deleteProductVariant);
