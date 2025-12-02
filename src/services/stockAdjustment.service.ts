import { prisma } from "../prisma";
import { AdjustmentType } from "@prisma/client";

interface CreateStockAdjustmentInput {
  warehouseId: number;
  productId: number;
  referenceNo?: string;
  adjustmentDate: Date;
  quantity: number;
  type: AdjustmentType;
  notes?: string;
  createdBy?: string;
}

interface UpdateStockAdjustmentInput {
  warehouseId?: number;
  productId?: number;
  referenceNo?: string;
  adjustmentDate?: Date;
  quantity?: number;
  type?: AdjustmentType;
  notes?: string;
}

interface GetStockAdjustmentsQuery {
  search?: string;
  warehouseId?: number;
  productId?: number;
  type?: AdjustmentType;
  createdBy?: string;
  page?: number;
  limit?: number;
}

export const stockAdjustmentService = {
  async createStockAdjustment(storeId: number, data: CreateStockAdjustmentInput) {
    return prisma.$transaction(async (tx) => {
      const adjustment = await tx.stockAdjustment.create({
        data: {
          storeId,
          ...data,
        },
        include: {
          warehouse: true,
          product: { select: { id: true, name: true } },
        },
      });

      const existingStock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: data.productId,
            warehouseId: data.warehouseId,
          },
        },
      });

      const quantityChange =
        data.type === "INCREASE" ? data.quantity : -data.quantity;

      if (existingStock) {
        await tx.stock.update({
          where: { id: existingStock.id },
          data: {
            quantity: Math.max(0, existingStock.quantity + quantityChange),
          },
        });
      } else if (data.type === "INCREASE") {
        await tx.stock.create({
          data: {
            storeId,
            productId: data.productId,
            warehouseId: data.warehouseId,
            quantity: data.quantity,
          },
        });
      }

      return adjustment;
    });
  },

  async getStockAdjustments(storeId: number, query: GetStockAdjustmentsQuery) {
    const { search, warehouseId, productId, type, createdBy, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (warehouseId) where.warehouseId = warehouseId;
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (createdBy) where.createdBy = createdBy;
    if (search) {
      where.OR = [
        { referenceNo: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [adjustments, total] = await Promise.all([
      prisma.stockAdjustment.findMany({
        where,
        skip,
        take: limit,
        include: {
          warehouse: true,
          product: { select: { id: true, name: true } },
        },
        orderBy: { adjustmentDate: "desc" },
      }),
      prisma.stockAdjustment.count({ where }),
    ]);

    return {
      adjustments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllStockAdjustments(storeId: number) {
    return prisma.stockAdjustment.findMany({
      where: { storeId },
      include: {
        warehouse: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: { adjustmentDate: "desc" },
    });
  },

  async getStockAdjustmentById(id: number) {
    const adjustment = await prisma.stockAdjustment.findUnique({
      where: { id },
      include: {
        warehouse: true,
        product: true,
      },
    });
    if (!adjustment) throw new Error("Stock adjustment not found");
    return adjustment;
  },

  async updateStockAdjustment(id: number, data: UpdateStockAdjustmentInput) {
    return prisma.stockAdjustment.update({
      where: { id },
      data,
      include: {
        warehouse: true,
        product: true,
      },
    });
  },

  async deleteStockAdjustment(id: number) {
    return prisma.stockAdjustment.delete({ where: { id } });
  },
};
