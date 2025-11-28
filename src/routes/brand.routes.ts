import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadSingle } from "@middlewares/upload.middleware";
import * as brandController from "@controllers/brand.controller";

export const brandRouter = Router();

brandRouter.post("/:storeId", authenticate, uploadSingle, brandController.createBrand);
brandRouter.get("/:storeId", authenticate, brandController.getBrands);
brandRouter.get("/:storeId/export", authenticate, brandController.exportBrandsCSV);
brandRouter.get("/:storeId/:id", authenticate, brandController.getBrandById);
brandRouter.put("/:id", authenticate, uploadSingle, brandController.updateBrand);
brandRouter.delete("/:id", authenticate, brandController.deleteBrand);
