import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as warehouseController from "@controllers/warehouse.controller";

export const warehouseRouter = Router();

warehouseRouter.post("/:storeId", authenticate, warehouseController.createWarehouse);
warehouseRouter.get("/:storeId/export", authenticate, warehouseController.exportWarehousesCSV);
warehouseRouter.get("/:storeId/all", authenticate, warehouseController.getAllWarehouses);
warehouseRouter.get("/:storeId/:id", authenticate, warehouseController.getWarehouseById);
warehouseRouter.get("/:storeId", authenticate, warehouseController.getWarehouses);
warehouseRouter.put("/:id", authenticate, warehouseController.updateWarehouse);
warehouseRouter.delete("/:id", authenticate, warehouseController.deleteWarehouse);
