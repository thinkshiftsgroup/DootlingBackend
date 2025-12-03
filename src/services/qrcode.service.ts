import { prisma } from "../prisma";
import { generateQRCode, generateQRCodeDataURL } from "@utils/qrcode";

export const qrcodeService = {
  async generateStockLotQRCode(
    lotId: number,
    format: "png" | "base64" = "png"
  ) {
    const lot = await prisma.stockLot.findUnique({
      where: { id: lotId },
      include: {
        product: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
      },
    });

    if (!lot) {
      throw new Error("Stock lot not found");
    }

    const qrData = JSON.stringify({
      type: "stock_lot",
      lotId: lot.id,
      lotReferenceNo: lot.lotReferenceNo,
      productId: lot.product.id,
      productName: lot.product.name,
      supplierId: lot.supplier.id,
      supplierName: lot.supplier.name,
      warehouseId: lot.warehouse.id,
      warehouseName: lot.warehouse.name,
      quantity: lot.quantity,
      purchaseDate: lot.purchaseDate,
      purchasePrice: lot.purchasePrice,
    });

    if (format === "base64") {
      return await generateQRCodeDataURL({ data: qrData });
    }

    return await generateQRCode({ data: qrData });
  },

  async generateProductQRCode(
    productId: number,
    format: "png" | "base64" = "png"
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        barcode: true,
        shortDescription: true,
        pricings: true,
      },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    const qrData = JSON.stringify({
      type: "product",
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      description: product.shortDescription,
      pricings: product.pricings,
    });

    if (format === "base64") {
      return await generateQRCodeDataURL({ data: qrData });
    }

    return await generateQRCode({ data: qrData });
  },

  async generateBulkStockLotQRCodes(
    supplierId?: number,
    warehouseId?: number,
    format: "png" | "base64" = "base64"
  ) {
    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (warehouseId) where.warehouseId = warehouseId;

    const lots = await prisma.stockLot.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
      },
    });

    const qrCodes = await Promise.all(
      lots.map(async (lot) => {
        const qrData = JSON.stringify({
          type: "stock_lot",
          lotId: lot.id,
          lotReferenceNo: lot.lotReferenceNo,
          productId: lot.product.id,
          productName: lot.product.name,
          quantity: lot.quantity,
        });

        if (format === "base64") {
          const dataURL = await generateQRCodeDataURL({ data: qrData });
          return {
            lotId: lot.id,
            lotReferenceNo: lot.lotReferenceNo,
            productName: lot.product.name,
            qrCode: dataURL,
          };
        }

        const buffer = await generateQRCode({ data: qrData });
        return {
          lotId: lot.id,
          lotReferenceNo: lot.lotReferenceNo,
          productName: lot.product.name,
          qrCode: buffer.toString("base64"),
        };
      })
    );

    return qrCodes;
  },
};
