import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as internalTransferController from "@controllers/internalTransfer.controller";

export const internalTransferRouter = Router();

internalTransferRouter.post("/:storeId", authenticate, internalTransferController.createInternalTransfer);
internalTransferRouter.get("/:storeId/export", authenticate, internalTransferController.exportInternalTransfersCSV);
internalTransferRouter.get("/:storeId/all", authenticate, internalTransferController.getAllInternalTransfers);
internalTransferRouter.get("/:storeId/:id", authenticate, internalTransferController.getInternalTransferById);
internalTransferRouter.get("/:storeId", authenticate, internalTransferController.getInternalTransfers);
internalTransferRouter.put("/:id", authenticate, internalTransferController.updateInternalTransfer);
internalTransferRouter.delete("/:id", authenticate, internalTransferController.deleteInternalTransfer);
