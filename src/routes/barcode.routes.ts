import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import * as barcodeController from "@controllers/barcode.controller";

export const barcodeRouter = Router();

barcodeRouter.get("/product/:productId", authenticate, barcodeController.generateProductBarcode);
barcodeRouter.get("/lot/:lotId", authenticate, barcodeController.generateLotBarcode);
barcodeRouter.post("/bulk", authenticate, barcodeController.generateBulkBarcodes);
