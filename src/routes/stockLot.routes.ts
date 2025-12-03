import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as stockLotController from "@controllers/stockLot.controller";

export const stockLotRouter = Router();

stockLotRouter.post("/:storeId", authenticate, verifyStoreAccess, stockLotController.createStockLot);
stockLotRouter.post("/:storeId/import", authenticate, verifyStoreAccess, stockLotController.importStockLotsCSV);
stockLotRouter.get("/:storeId/export", authenticate, verifyStoreAccess, stockLotController.exportStockLotsCSV);
stockLotRouter.get("/:storeId/all", authenticate, verifyStoreAccess, stockLotController.getAllStockLots);
stockLotRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, stockLotController.getStockLotById);
stockLotRouter.get("/:storeId", authenticate, verifyStoreAccess, stockLotController.getStockLots);
stockLotRouter.put("/:id", authenticate, verifyResourceOwnership("stockLot"), stockLotController.updateStockLot);
stockLotRouter.delete("/:id", authenticate, verifyResourceOwnership("stockLot"), stockLotController.deleteStockLot);
