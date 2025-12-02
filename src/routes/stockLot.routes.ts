import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as stockLotController from "@controllers/stockLot.controller";

export const stockLotRouter = Router();

stockLotRouter.post("/:storeId", authenticate, stockLotController.createStockLot);
stockLotRouter.post("/:storeId/import", authenticate, stockLotController.importStockLotsCSV);
stockLotRouter.get("/:storeId/export", authenticate, stockLotController.exportStockLotsCSV);
stockLotRouter.get("/:storeId/all", authenticate, stockLotController.getAllStockLots);
stockLotRouter.get("/:storeId/:id", authenticate, stockLotController.getStockLotById);
stockLotRouter.get("/:storeId", authenticate, stockLotController.getStockLots);
stockLotRouter.put("/:id", authenticate, stockLotController.updateStockLot);
stockLotRouter.delete("/:id", authenticate, stockLotController.deleteStockLot);
