import prisma from "@/prisma";

interface CreateProductGroupInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface UpdateProductGroupInput {
  name?: string;
  description?: string;
  imageUrl?: string;
}

interface GetProductGroupsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const productGroupService = {
  async createProductGroup(storeId: number, data: CreateProductGroupInput) {
    return prisma.productGroup.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
  },

  async getProductGroups(storeId: number, query: GetProductGroupsQuery) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [groups, total] = await Promise.all([
      prisma.productGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.productGroup.count({ where }),
    ]);

    return {
      groups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllProductGroups(storeId: number) {
    return prisma.productGroup.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductGroupById(id: number) {
    const group = await prisma.productGroup.findUnique({ where: { id } });
    if (!group) throw new Error("Product group not found");
    return group;
  },

  async updateProductGroup(id: number, data: UpdateProductGroupInput) {
    return prisma.productGroup.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
      },
    });
  },

  async deleteProductGroup(id: number) {
    return prisma.productGroup.delete({ where: { id } });
  },
};
