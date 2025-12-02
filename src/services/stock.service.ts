import { prisma } from "../prisma";

interface GetStocksQuery {
  search?: string;
  warehouseId?: number;
  categoryId?: number;
  brandId?: number;
  page?: number;
  limit?: number;
}

export const stockService = {
  async getStocks(storeId: number, query: GetStocksQuery) {
    const { search, warehouseId, categoryId, brandId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (warehouseId) where.warehouseId = warehouseId;
    
    if (search || categoryId || brandId) {
      where.product = {};
      if (search) {
        where.product.name = { contains: search, mode: "insensitive" };
      }
      if (categoryId) {
        where.product.categories = {
          some: { categoryId },
        };
      }
    }

    const [stocks, total] = await Promise.all([
      prisma.stock.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productImages: true,
              categories: {
                include: {
                  category: true,
                },
              },
            },
          },
          warehouse: true,
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      stocks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllStocks(storeId: number) {
    return prisma.stock.findMany({
      where: { storeId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            productImages: true,
          },
        },
        warehouse: true,
      },
      orderBy: { updatedAt: "desc" },
    });
  },

  async getStockByProductAndWarehouse(productId: number, warehouseId: number) {
    return prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
      include: {
        product: true,
        warehouse: true,
      },
    });
  },

  async getStocksByProduct(productId: number) {
    return prisma.stock.findMany({
      where: { productId },
      include: {
        warehouse: true,
      },
    });
  },
};
