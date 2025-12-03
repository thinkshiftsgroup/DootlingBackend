import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import * as internalTransferController from "@controllers/internalTransfer.controller";

export const internalTransferRouter = Router();

internalTransferRouter.post("/:storeId", authenticate, verifyStoreAccess, internalTransferController.createInternalTransfer);
internalTransferRouter.get("/:storeId/export", authenticate, verifyStoreAccess, internalTransferController.exportInternalTransfersCSV);
internalTransferRouter.get("/:storeId/all", authenticate, verifyStoreAccess, internalTransferController.getAllInternalTransfers);
internalTransferRouter.get("/:storeId/:id", authenticate, verifyStoreAccess, internalTransferController.getInternalTransferById);
internalTransferRouter.get("/:storeId", authenticate, verifyStoreAccess, internalTransferController.getInternalTransfers);
internalTransferRouter.put("/:id", authenticate, verifyResourceOwnership("internalTransfer"), internalTransferController.updateInternalTransfer);
internalTransferRouter.delete("/:id", authenticate, verifyResourceOwnership("internalTransfer"), internalTransferController.deleteInternalTransfer);
