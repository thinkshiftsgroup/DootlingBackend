import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess } from "@middlewares/tenant.middleware";
import * as stockController from "@controllers/stock.controller";

export const stockRouter = Router();

stockRouter.get("/:storeId/export", authenticate, verifyStoreAccess, stockController.exportStocksCSV);
stockRouter.get("/:storeId/all", authenticate, verifyStoreAccess, stockController.getAllStocks);
stockRouter.get("/:storeId/product/:productId", authenticate, verifyStoreAccess, stockController.getStocksByProduct);
stockRouter.get("/:storeId/product/:productId/warehouse/:warehouseId", authenticate, verifyStoreAccess, stockController.getStockByProductAndWarehouse);
stockRouter.get("/:storeId", authenticate, verifyStoreAccess, stockController.getStocks);
