import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as productVariantController from "@controllers/productVariant.controller";

export const productVariantRouter = Router();

productVariantRouter.post("/:storeId", authenticate, productVariantController.createProductVariant);
productVariantRouter.get("/:storeId", authenticate, productVariantController.getProductVariants);
productVariantRouter.get("/:storeId/export", authenticate, productVariantController.exportProductVariantsCSV);
productVariantRouter.get("/:storeId/:id", authenticate, productVariantController.getProductVariantById);
productVariantRouter.put("/:id", authenticate, productVariantController.updateProductVariant);
productVariantRouter.delete("/:id", authenticate, productVariantController.deleteProductVariant);
