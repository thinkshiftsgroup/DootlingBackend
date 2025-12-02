import { Request, Response } from "express";
import { asyncHandler } from "@utils/asyncHandler";
import { generateBarcode, generateBarcodeDataURL } from "@utils/barcode";
import { stockLotService } from "@services/stockLot.service";
import { prisma } from "../prisma";

export const generateProductBarcode = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { format = "png", type = "code128" } = req.query;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(productId) },
    select: { barcode: true, name: true },
  });

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  if (!product.barcode) {
    return res.status(400).json({ success: false, message: "Product has no barcode" });
  }

  if (format === "base64") {
    const dataURL = await generateBarcodeDataURL({
      text: product.barcode,
      type: type as string,
    });
    return res.status(200).json({ success: true, data: { barcode: dataURL } });
  }

  const barcodeBuffer = await generateBarcode({
    text: product.barcode,
    type: type as string,
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `inline; filename="${product.name}-barcode.png"`);
  res.send(barcodeBuffer);
});

export const generateLotBarcode = asyncHandler(async (req: Request, res: Response) => {
  const { lotId } = req.params;
  const { format = "png", type = "code128", pageStyle = "A4" } = req.query;

  const lot = await stockLotService.getStockLotById(parseInt(lotId));

  if (!lot) {
    return res.status(404).json({ success: false, message: "Stock lot not found" });
  }

  const barcodeText = lot.lotReferenceNo;

  if (format === "base64") {
    const dataURL = await generateBarcodeDataURL({
      text: barcodeText,
      type: type as string,
    });
    return res.status(200).json({ success: true, data: { barcode: dataURL } });
  }

  const barcodeBuffer = await generateBarcode({
    text: barcodeText,
    type: type as string,
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `inline; filename="lot-${lot.lotReferenceNo}-barcode.png"`);
  res.send(barcodeBuffer);
});

export const generateBulkBarcodes = asyncHandler(async (req: Request, res: Response) => {
  const { lotId, supplierId } = req.body;
  const { format = "base64" } = req.query;

  let products: any[] = [];

  if (lotId) {
    const lot = await stockLotService.getStockLotById(parseInt(lotId));
    products = [
      {
        id: lot.product.id,
        name: lot.product.name,
        barcode: lot.lotReferenceNo,
        quantity: lot.quantity,
      },
    ];
  } else if (supplierId) {
    const lots = await prisma.stockLot.findMany({
      where: { supplierId: parseInt(supplierId) },
      include: {
        product: { select: { id: true, name: true, barcode: true } },
      },
    });

    products = lots.map((lot) => ({
      id: lot.product.id,
      name: lot.product.name,
      barcode: lot.product.barcode || lot.lotReferenceNo,
      quantity: lot.quantity,
    }));
  }

  const barcodes = await Promise.all(
    products.map(async (product) => {
      const dataURL = await generateBarcodeDataURL({
        text: product.barcode,
      });
      return {
        productId: product.id,
        productName: product.name,
        barcode: dataURL,
        quantity: product.quantity,
      };
    })
  );

  res.status(200).json({ success: true, data: barcodes });
});
