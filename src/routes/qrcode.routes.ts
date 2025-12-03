import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as qrcodeController from "@controllers/qrcode.controller";

export const qrcodeRouter = Router();

qrcodeRouter.get(
  "/lot/:lotId",
  authenticate,
  qrcodeController.generateStockLotQRCode
);
qrcodeRouter.get(
  "/lot/:lotId/download",
  authenticate,
  qrcodeController.downloadStockLotQRCode
);
qrcodeRouter.get(
  "/product/:productId",
  authenticate,
  qrcodeController.generateProductQRCode
);
qrcodeRouter.get(
  "/product/:productId/download",
  authenticate,
  qrcodeController.downloadProductQRCode
);
qrcodeRouter.post("/bulk", authenticate, qrcodeController.generateBulkQRCodes);
