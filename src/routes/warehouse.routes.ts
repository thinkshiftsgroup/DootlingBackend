import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as warehouseController from "@controllers/warehouse.controller";

export const warehouseRouter = Router();

warehouseRouter.post("/:storeId", authenticate, verifyStoreAccess, warehouseController.createWarehouse);
warehouseRouter.get("/:storeId/export", authenticate, verifyStoreAccess, warehouseController.exportWarehousesCSV);
warehouseRouter.get("/:storeId/all", authenticate, verifyStoreAccess, warehouseController.getAllWarehouses);
warehouseRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, warehouseController.getWarehouseById);
warehouseRouter.get("/:storeId", authenticate, verifyStoreAccess, warehouseController.getWarehouses);
warehouseRouter.put("/:id", authenticate, verifyResourceOwnership("warehouse"), warehouseController.updateWarehouse);
warehouseRouter.delete("/:id", authenticate, verifyResourceOwnership("warehouse"), warehouseController.deleteWarehouse);
