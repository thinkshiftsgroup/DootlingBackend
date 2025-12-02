import { Request, Response } from "express";
import { stockService } from "@services/stock.service";
import { asyncHandler } from "@utils/asyncHandler";
import { Parser } from "json2csv";

export const getStocks = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const { search, warehouseId, categoryId, brandId, page = "1", limit = "10" } = req.query;

  const stocks = await stockService.getStocks(storeId, {
    search: search as string,
    warehouseId: warehouseId ? parseInt(warehouseId as string) : undefined,
    categoryId: categoryId ? parseInt(categoryId as string) : undefined,
    brandId: brandId ? parseInt(brandId as string) : undefined,
    page: parseInt(page as string),
    limit: parseInt(limit as string),
  });

  res.status(200).json({ success: true, data: stocks });
});

export const getAllStocks = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stocks = await stockService.getAllStocks(storeId);
  res.status(200).json({ success: true, data: stocks });
});

export const getStockByProductAndWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { productId, warehouseId } = req.params;
  const stock = await stockService.getStockByProductAndWarehouse(
    parseInt(productId),
    parseInt(warehouseId)
  );
  res.status(200).json({ success: true, data: stock });
});

export const getStocksByProduct = asyncHandler(async (req: Request, res: Response) => {
  const productId = parseInt(req.params.productId);
  const stocks = await stockService.getStocksByProduct(productId);
  res.status(200).json({ success: true, data: stocks });
});

export const exportStocksCSV = asyncHandler(async (req: Request, res: Response) => {
  const storeId = parseInt(req.params.storeId);
  const stocks = await stockService.getAllStocks(storeId);

  const data = stocks.map((stock) => ({
    id: stock.id,
    product: stock.product.name,
    warehouse: stock.warehouse.name,
    quantity: stock.quantity,
    avgPurchasePrice: stock.avgPurchasePrice,
    sellingPrice: stock.sellingPrice,
    updatedAt: stock.updatedAt,
  }));

  const fields = ["id", "product", "warehouse", "quantity", "avgPurchasePrice", "sellingPrice", "updatedAt"];
  const parser = new Parser({ fields });
  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("stocks.csv");
  res.send(csv);
});
