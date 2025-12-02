import { prisma } from "../prisma";
import { PurchaseStatus } from "@prisma/client";

interface CreateStockLotInput {
  warehouseId: number;
  supplierId: number;
  productId: number;
  lotReferenceNo: string;
  purchaseDate: Date;
  quantity: number;
  purchasePrice: number;
  otherCharges?: number;
  discount?: number;
  status?: PurchaseStatus;
  notes?: string;
  createdBy?: string;
}

interface UpdateStockLotInput {
  warehouseId?: number;
  supplierId?: number;
  productId?: number;
  purchaseDate?: Date;
  quantity?: number;
  purchasePrice?: number;
  otherCharges?: number;
  discount?: number;
  status?: PurchaseStatus;
  notes?: string;
}

interface GetStockLotsQuery {
  search?: string;
  warehouseId?: number;
  supplierId?: number;
  status?: PurchaseStatus;
  page?: number;
  limit?: number;
}

export const stockLotService = {
  async createStockLot(storeId: number, data: CreateStockLotInput) {
    return prisma.$transaction(async (tx) => {
      const stockLot = await tx.stockLot.create({
        data: {
          storeId,
          ...data,
        },
        include: {
          warehouse: true,
          supplier: true,
          product: true,
        },
      });

      if (data.status === "DELIVERED") {
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: data.productId,
              warehouseId: data.warehouseId,
            },
          },
        });

        if (existingStock) {
          const newQuantity = existingStock.quantity + data.quantity;
          const newAvgPrice =
            ((existingStock.avgPurchasePrice || 0) * existingStock.quantity +
              data.purchasePrice * data.quantity) /
            newQuantity;

          await tx.stock.update({
            where: { id: existingStock.id },
            data: {
              quantity: newQuantity,
              avgPurchasePrice: newAvgPrice,
            },
          });
        } else {
          await tx.stock.create({
            data: {
              storeId,
              productId: data.productId,
              warehouseId: data.warehouseId,
              quantity: data.quantity,
              avgPurchasePrice: data.purchasePrice,
            },
          });
        }
      }

      return stockLot;
    });
  },

  async getStockLots(storeId: number, query: GetStockLotsQuery) {
    const { search, warehouseId, supplierId, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (warehouseId) where.warehouseId = warehouseId;
    if (supplierId) where.supplierId = supplierId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { lotReferenceNo: { contains: search, mode: "insensitive" } },
        { supplier: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [stockLots, total] = await Promise.all([
      prisma.stockLot.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          supplier: true,
          product: { select: { id: true, name: true } },
        },
        orderBy: { purchaseDate: "desc" },
      }),
      prisma.stockLot.count({ where }),
    ]);

    return {
      stockLots,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllStockLots(storeId: number) {
    return prisma.stockLot.findMany({
      where: { storeId },
      include: {
        warehouse: true,
        supplier: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: { purchaseDate: "desc" },
    });
  },

  async getStockLotById(id: number) {
    const stockLot = await prisma.stockLot.findUnique({
      where: { id },
      include: {
        warehouse: true,
        supplier: true,
        product: true,
      },
    });
    if (!stockLot) throw new Error("Stock lot not found");
    return stockLot;
  },

  async updateStockLot(id: number, data: UpdateStockLotInput) {
    const existingLot = await prisma.stockLot.findUnique({ where: { id } });
    if (!existingLot) throw new Error("Stock lot not found");

    return prisma.$transaction(async (tx) => {
      const updatedLot = await tx.stockLot.update({
        where: { id },
        data,
        include: {
          warehouse: true,
          supplier: true,
          product: true,
        },
      });

      if (
        data.status === "DELIVERED" &&
        existingLot.status !== "DELIVERED"
      ) {
        const warehouseId = data.warehouseId || existingLot.warehouseId;
        const productId = data.productId || existingLot.productId;
        const quantity = data.quantity || existingLot.quantity;
        const purchasePrice = data.purchasePrice || existingLot.purchasePrice;

        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId,
            },
          },
        });

        if (existingStock) {
          const newQuantity = existingStock.quantity + quantity;
          const newAvgPrice =
            ((existingStock.avgPurchasePrice || 0) * existingStock.quantity +
              purchasePrice * quantity) /
            newQuantity;

          await tx.stock.update({
            where: { id: existingStock.id },
            data: {
              quantity: newQuantity,
              avgPurchasePrice: newAvgPrice,
            },
          });
        } else {
          await tx.stock.create({
            data: {
              storeId: existingLot.storeId,
              productId,
              warehouseId,
              quantity,
              avgPurchasePrice: purchasePrice,
            },
          });
        }
      }

      return updatedLot;
    });
  },

  async deleteStockLot(id: number) {
    return prisma.stockLot.delete({ where: { id } });
  },

  async importStockLots(storeId: number, lots: CreateStockLotInput[]) {
    const results = [];
    for (const lot of lots) {
      try {
        const created = await this.createStockLot(storeId, lot);
        results.push({ success: true, data: created });
      } catch (error: any) {
        results.push({ success: false, error: error.message, data: lot });
      }
    }
    return results;
  },
};
