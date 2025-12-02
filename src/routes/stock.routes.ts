import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as stockController from "@controllers/stock.controller";

export const stockRouter = Router();

stockRouter.get("/:storeId/export", authenticate, stockController.exportStocksCSV);
stockRouter.get("/:storeId/all", authenticate, stockController.getAllStocks);
stockRouter.get("/:storeId/product/:productId", authenticate, stockController.getStocksByProduct);
stockRouter.get("/:storeId/product/:productId/warehouse/:warehouseId", authenticate, stockController.getStockByProductAndWarehouse);
stockRouter.get("/:storeId", authenticate, stockController.getStocks);
