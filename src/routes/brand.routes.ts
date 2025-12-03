import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadSingle } from "@middlewares/upload.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as brandController from "@controllers/brand.controller";

export const brandRouter = Router();

brandRouter.post("/:storeId", authenticate, verifyStoreAccess, uploadSingle, brandController.createBrand);
brandRouter.get("/:storeId/export", authenticate, verifyStoreAccess, brandController.exportBrandsCSV);
brandRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, brandController.getBrandById);
brandRouter.get("/:storeId", authenticate, verifyStoreAccess, brandController.getBrands);
brandRouter.put("/:id", authenticate, verifyResourceOwnership("brand"), uploadSingle, brandController.updateBrand);
brandRouter.delete("/:id", authenticate, verifyResourceOwnership("brand"), brandController.deleteBrand);
