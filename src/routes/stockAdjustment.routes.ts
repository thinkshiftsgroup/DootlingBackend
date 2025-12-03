import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as stockAdjustmentController from "@controllers/stockAdjustment.controller";

export const stockAdjustmentRouter = Router();

stockAdjustmentRouter.post("/:storeId", authenticate, verifyStoreAccess, stockAdjustmentController.createStockAdjustment);
stockAdjustmentRouter.get("/:storeId/export", authenticate, verifyStoreAccess, stockAdjustmentController.exportStockAdjustmentsCSV);
stockAdjustmentRouter.get("/:storeId/all", authenticate, verifyStoreAccess, stockAdjustmentController.getAllStockAdjustments);
stockAdjustmentRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, stockAdjustmentController.getStockAdjustmentById);
stockAdjustmentRouter.get("/:storeId", authenticate, verifyStoreAccess, stockAdjustmentController.getStockAdjustments);
stockAdjustmentRouter.put("/:id", authenticate, verifyResourceOwnership("stockAdjustment"), stockAdjustmentController.updateStockAdjustment);
stockAdjustmentRouter.delete("/:id", authenticate, verifyResourceOwnership("stockAdjustment"), stockAdjustmentController.deleteStockAdjustment);
