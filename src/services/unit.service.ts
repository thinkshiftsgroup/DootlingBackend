import { prisma } from "../prisma";

interface CreateUnitInput {
  name: string;
  status?: string;
}

interface UpdateUnitInput {
  name?: string;
  status?: string;
}

interface GetUnitsQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const unitService = {
  async createUnit(storeId: number, data: CreateUnitInput) {
    return prisma.unit.create({
      data: {
        storeId,
        name: data.name,
        status: data.status || "active",
      },
    });
  },

  async getUnits(storeId: number, query: GetUnitsQuery) {
    const { search, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    
    if (status) {
      where.status = status;
    }

    const [units, total] = await Promise.all([
      prisma.unit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.unit.count({ where }),
    ]);

    return {
      units,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllUnits(storeId: number) {
    return prisma.unit.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getUnitById(id: number) {
    const unit = await prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new Error("Unit not found");
    return unit;
  },

  async updateUnit(id: number, data: UpdateUnitInput) {
    return prisma.unit.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.status && { status: data.status }),
      },
    });
  },

  async deleteUnit(id: number) {
    return prisma.unit.delete({ where: { id } });
  },
};