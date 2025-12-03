import { prisma } from "../prisma";
import { TransferStatus } from "@prisma/client";

interface CreateInternalTransferInput {
  fromWarehouseId: number;
  toWarehouseId: number;
  productId: number;
  referenceNo?: string;
  transferDate: Date;
  quantity: number;
  costForTransfer?: number;
  status?: TransferStatus;
  notes?: string;
  createdBy?: string;
}

interface UpdateInternalTransferInput {
  fromWarehouseId?: number;
  toWarehouseId?: number;
  productId?: number;
  referenceNo?: string;
  transferDate?: Date;
  quantity?: number;
  costForTransfer?: number;
  status?: TransferStatus;
  notes?: string;
}

interface GetInternalTransfersQuery {
  search?: string;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  status?: TransferStatus;
  page?: number;
  limit?: number;
}

export const internalTransferService = {
  async createInternalTransfer(storeId: number, data: CreateInternalTransferInput) {
    if (data.fromWarehouseId === data.toWarehouseId) {
      throw new Error("Cannot transfer to the same warehouse");
    }

    return prisma.$transaction(async (tx) => {
      const transfer = await tx.internalTransfer.create({
        data: {
          storeId,
          ...data,
        },
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          product: { select: { id: true, name: true } },
        },
      });

      if (data.status === "COMPLETED") {
        const fromStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: data.productId,
              warehouseId: data.fromWarehouseId,
            },
          },
        });

        if (!fromStock || fromStock.quantity < data.quantity) {
          throw new Error("Insufficient stock in source warehouse");
        }

        await tx.stock.update({
          where: { id: fromStock.id },
          data: { quantity: fromStock.quantity - data.quantity },
        });

        const toStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: data.productId,
              warehouseId: data.toWarehouseId,
            },
          },
        });

        if (toStock) {
          await tx.stock.update({
            where: { id: toStock.id },
            data: { quantity: toStock.quantity + data.quantity },
          });
        } else {
          await tx.stock.create({
            data: {
              storeId,
              productId: data.productId,
              warehouseId: data.toWarehouseId,
              quantity: data.quantity,
              avgPurchasePrice: fromStock.avgPurchasePrice,
            },
          });
        }
      }

      return transfer;
    });
  },

  async getInternalTransfers(storeId: number, query: GetInternalTransfersQuery) {
    const { search, fromWarehouseId, toWarehouseId, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (fromWarehouseId) where.fromWarehouseId = fromWarehouseId;
    if (toWarehouseId) where.toWarehouseId = toWarehouseId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { referenceNo: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [transfers, total] = await Promise.all([
      prisma.internalTransfer.findMany({
        where,
        skip,
        take: limit,
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          product: { select: { id: true, name: true } },
        },
        orderBy: { transferDate: "desc" },
      }),
      prisma.internalTransfer.count({ where }),
    ]);

    return {
      transfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllInternalTransfers(storeId: number) {
    return prisma.internalTransfer.findMany({
      where: { storeId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        product: { select: { id: true, name: true } },
      },
      orderBy: { transferDate: "desc" },
    });
  },

  async getInternalTransferById(id: number, storeId: number) {
    const transfer = await prisma.internalTransfer.findFirst({
      where: { id, storeId },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        product: true,
      },
    });
    if (!transfer) throw new Error("Internal transfer not found or access denied");
    return transfer;
  },

  async updateInternalTransfer(id: number, storeId: number, data: UpdateInternalTransferInput) {
    const existingTransfer = await prisma.internalTransfer.findFirst({ 
      where: { id, storeId } 
    });
    if (!existingTransfer) throw new Error("Internal transfer not found or access denied");

    if (data.fromWarehouseId && data.toWarehouseId && data.fromWarehouseId === data.toWarehouseId) {
      throw new Error("Cannot transfer to the same warehouse");
    }

    return prisma.$transaction(async (tx) => {
      const updatedTransfer = await tx.internalTransfer.update({
        where: { id },
        data,
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          product: true,
        },
      });

      if (data.status === "COMPLETED" && existingTransfer.status !== "COMPLETED") {
        const fromWarehouseId = data.fromWarehouseId || existingTransfer.fromWarehouseId;
        const toWarehouseId = data.toWarehouseId || existingTransfer.toWarehouseId;
        const productId = data.productId || existingTransfer.productId;
        const quantity = data.quantity || existingTransfer.quantity;

        const fromStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: fromWarehouseId,
            },
          },
        });

        if (!fromStock || fromStock.quantity < quantity) {
          throw new Error("Insufficient stock in source warehouse");
        }

        await tx.stock.update({
          where: { id: fromStock.id },
          data: { quantity: fromStock.quantity - quantity },
        });

        const toStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId,
            },
          },
        });

        if (toStock) {
          await tx.stock.update({
            where: { id: toStock.id },
            data: { quantity: toStock.quantity + quantity },
          });
        } else {
          await tx.stock.create({
            data: {
              storeId: existingTransfer.storeId,
              productId,
              warehouseId: toWarehouseId,
              quantity,
              avgPurchasePrice: fromStock.avgPurchasePrice,
            },
          });
        }
      }

      return updatedTransfer;
    });
  },

  async deleteInternalTransfer(id: number, storeId: number) {
    // Verify ownership first
    const transfer = await prisma.internalTransfer.findFirst({
      where: { id, storeId }
    });
    if (!transfer) throw new Error("Internal transfer not found or access denied");

    return prisma.internalTransfer.delete({ where: { id } });
  },
};
