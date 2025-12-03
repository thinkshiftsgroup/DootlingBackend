import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { qrcodeService } from "@services/qrcode.service";

export const generateStockLotQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { lotId } = req.params;
    const { format = "png", pageStyle = "A4" } = req.query;

    if (format === "base64") {
      const dataURL = await qrcodeService.generateStockLotQRCode(
        parseInt(lotId),
        "base64"
      );
      return res.status(200).json({ success: true, data: { qrCode: dataURL } });
    }

    const qrCodeBuffer = await qrcodeService.generateStockLotQRCode(
      parseInt(lotId),
      "png"
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="lot-${lotId}-qrcode.png"`
    );
    res.send(qrCodeBuffer);
  }
);

export const generateProductQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { format = "png" } = req.query;

    if (format === "base64") {
      const dataURL = await qrcodeService.generateProductQRCode(
        parseInt(productId),
        "base64"
      );
      return res.status(200).json({ success: true, data: { qrCode: dataURL } });
    }

    const qrCodeBuffer = await qrcodeService.generateProductQRCode(
      parseInt(productId),
      "png"
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="product-${productId}-qrcode.png"`
    );
    res.send(qrCodeBuffer);
  }
);

export const generateBulkQRCodes = asyncHandler(
  async (req: Request, res: Response) => {
    const { supplierId, warehouseId } = req.body;
    const { format = "base64", pageStyle = "A4" } = req.query;

    const qrCodes = await qrcodeService.generateBulkStockLotQRCodes(
      supplierId ? parseInt(supplierId) : undefined,
      warehouseId ? parseInt(warehouseId) : undefined,
      format as "png" | "base64"
    );

    res.status(200).json({ success: true, data: qrCodes });
  }
);

export const downloadStockLotQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { lotId } = req.params;

    const qrCodeBuffer = await qrcodeService.generateStockLotQRCode(
      parseInt(lotId),
      "png"
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lot-${lotId}-qrcode.png"`
    );
    res.send(qrCodeBuffer);
  }
);

export const downloadProductQRCode = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.params;

    const qrCodeBuffer = await qrcodeService.generateProductQRCode(
      parseInt(productId),
      "png"
    );

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="product-${productId}-qrcode.png"`
    );
    res.send(qrCodeBuffer);
  }
);
