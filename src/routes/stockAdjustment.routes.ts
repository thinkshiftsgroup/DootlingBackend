import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as stockAdjustmentController from "@controllers/stockAdjustment.controller";

export const stockAdjustmentRouter = Router();

stockAdjustmentRouter.post("/:storeId", authenticate, stockAdjustmentController.createStockAdjustment);
stockAdjustmentRouter.get("/:storeId/export", authenticate, stockAdjustmentController.exportStockAdjustmentsCSV);
stockAdjustmentRouter.get("/:storeId/all", authenticate, stockAdjustmentController.getAllStockAdjustments);
stockAdjustmentRouter.get("/:storeId/:id", authenticate, stockAdjustmentController.getStockAdjustmentById);
stockAdjustmentRouter.get("/:storeId", authenticate, stockAdjustmentController.getStockAdjustments);
stockAdjustmentRouter.put("/:id", authenticate, stockAdjustmentController.updateStockAdjustment);
stockAdjustmentRouter.delete("/:id", authenticate, stockAdjustmentController.deleteStockAdjustment);
