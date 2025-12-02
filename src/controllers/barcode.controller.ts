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
  const { format = "base64", download = "false" } = req.query;

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

  if (download === "true" && format === "png") {
    // Generate PDF with barcodes for download
    const barcodeBuffers = await Promise.all(
      products.map(async (product) => {
        const buffer = await generateBarcode({
          text: product.barcode,
        });
        return {
          productName: product.name,
          barcode: product.barcode,
          buffer,
        };
      })
    );

    // Create a simple HTML page with all barcodes
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Barcodes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .barcode-item { page-break-inside: avoid; margin-bottom: 30px; text-align: center; }
          .barcode-item img { max-width: 300px; height: auto; }
          .barcode-item p { margin: 10px 0; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Barcode Labels</h1>
    `;

    for (const item of barcodeBuffers) {
      const base64 = item.buffer.toString("base64");
      html += `
        <div class="barcode-item">
          <p><strong>${item.productName}</strong></p>
          <img src="data:image/png;base64,${base64}" alt="Barcode: ${item.barcode}">
          <p>${item.barcode}</p>
        </div>
      `;
    }

    html += `
      </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", 'attachment; filename="barcodes.html"');
    return res.send(html);
  }

  const barcodes = await Promise.all(
    products.map(async (product) => {
      if (format === "png") {
        const buffer = await generateBarcode({
          text: product.barcode,
        });
        return {
          productId: product.id,
          productName: product.name,
          barcode: buffer.toString("base64"),
          quantity: product.quantity,
          format: "base64",
        };
      } else {
        const dataURL = await generateBarcodeDataURL({
          text: product.barcode,
        });
        return {
          productId: product.id,
          productName: product.name,
          barcode: dataURL,
          quantity: product.quantity,
          format: "dataURL",
        };
      }
    })
  );

  res.status(200).json({ success: true, data: barcodes });
});

export const downloadBarcodeImage = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { type = "code128" } = req.query;

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

  const barcodeBuffer = await generateBarcode({
    text: product.barcode,
    type: type as string,
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename="${product.name}-barcode.png"`);
  res.send(barcodeBuffer);
});

export const downloadLotBarcodeImage = asyncHandler(async (req: Request, res: Response) => {
  const { lotId } = req.params;
  const { type = "code128" } = req.query;

  const lot = await stockLotService.getStockLotById(parseInt(lotId));

  if (!lot) {
    return res.status(404).json({ success: false, message: "Stock lot not found" });
  }

  const barcodeBuffer = await generateBarcode({
    text: lot.lotReferenceNo,
    type: type as string,
  });

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Disposition", `attachment; filename="lot-${lot.lotReferenceNo}-barcode.png"`);
  res.send(barcodeBuffer);
});
