import { prisma } from "../prisma";

interface CreateCustomerGroupInput {
  name: string;
  description?: string;
}

interface UpdateCustomerGroupInput {
  name?: string;
  description?: string;
}

interface GetCustomerGroupsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const customerGroupService = {
  async createCustomerGroup(storeId: number, data: CreateCustomerGroupInput) {
    return prisma.customerGroup.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
      },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });
  },

  async getCustomerGroups(storeId: number, query: GetCustomerGroupsQuery) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customerGroups, total] = await Promise.all([
      prisma.customerGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { customers: true },
          },
        },
      }),
      prisma.customerGroup.count({ where }),
    ]);

    return {
      customerGroups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllCustomerGroups(storeId: number) {
    return prisma.customerGroup.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });
  },

  async getCustomerGroupById(id: number, storeId: number) {
    const customerGroup = await prisma.customerGroup.findFirst({
      where: { id, storeId },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });
    if (!customerGroup) throw new Error("Customer group not found or access denied");
    return customerGroup;
  },

  async updateCustomerGroup(id: number, storeId: number, data: UpdateCustomerGroupInput) {
    // Verify ownership first
    const customerGroup = await prisma.customerGroup.findFirst({
      where: { id, storeId }
    });
    if (!customerGroup) throw new Error("Customer group not found or access denied");

    return prisma.customerGroup.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });
  },

  async deleteCustomerGroup(id: number, storeId: number) {
    // Verify ownership first
    const customerGroup = await prisma.customerGroup.findFirst({
      where: { id, storeId }
    });
    if (!customerGroup) throw new Error("Customer group not found or access denied");

    return prisma.customerGroup.delete({ where: { id } });
  },
};
