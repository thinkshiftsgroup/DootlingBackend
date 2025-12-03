import { prisma } from "../prisma";

interface CreateWarehouseInput {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  isActive?: boolean;
}

interface UpdateWarehouseInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  phone?: string;
  isActive?: boolean;
}

interface GetWarehousesQuery {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export const warehouseService = {
  async createWarehouse(storeId: number, data: CreateWarehouseInput) {
    return prisma.warehouse.create({
      data: {
        storeId,
        ...data,
      },
    });
  },

  async getWarehouses(storeId: number, query: GetWarehousesQuery) {
    const { search, isActive, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }

    const [warehouses, total] = await Promise.all([
      prisma.warehouse.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.warehouse.count({ where }),
    ]);

    return {
      warehouses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllWarehouses(storeId: number) {
    return prisma.warehouse.findMany({
      where: { storeId, isActive: true },
      orderBy: { name: "asc" },
    });
  },

  async getWarehouseById(id: number, storeId: number) {
    const warehouse = await prisma.warehouse.findFirst({ 
      where: { id, storeId } 
    });
    if (!warehouse) throw new Error("Warehouse not found or access denied");
    return warehouse;
  },

  async updateWarehouse(id: number, storeId: number, data: UpdateWarehouseInput) {
    // Verify ownership first
    const warehouse = await prisma.warehouse.findFirst({
      where: { id, storeId }
    });
    if (!warehouse) throw new Error("Warehouse not found or access denied");

    return prisma.warehouse.update({
      where: { id },
      data,
    });
  },

  async deleteWarehouse(id: number, storeId: number) {
    // Verify ownership first
    const warehouse = await prisma.warehouse.findFirst({
      where: { id, storeId }
    });
    if (!warehouse) throw new Error("Warehouse not found or access denied");

    return prisma.warehouse.delete({ where: { id } });
  },
};
