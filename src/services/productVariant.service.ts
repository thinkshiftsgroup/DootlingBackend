import { prisma } from "../prisma";

interface CreateProductVariantInput {
  name: string;
  hasMultipleOptions: boolean;
  options: string[];
}

interface UpdateProductVariantInput {
  name?: string;
  hasMultipleOptions?: boolean;
  options?: string[];
}

interface GetProductVariantsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const productVariantService = {
  async createProductVariant(storeId: number, data: CreateProductVariantInput) {
    return prisma.productVariant.create({
      data: {
        storeId,
        name: data.name,
        hasMultipleOptions: data.hasMultipleOptions,
        options: {
          create: data.options.map((optionName) => ({ name: optionName })),
        },
      },
      include: { options: true },
    });
  },

  async getProductVariants(storeId: number, query: GetProductVariantsQuery) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const [variants, total] = await Promise.all([
      prisma.productVariant.findMany({
        where,
        skip,
        take: limit,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.productVariant.count({ where }),
    ]);

    return {
      variants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllProductVariants(storeId: number) {
    return prisma.productVariant.findMany({
      where: { storeId },
      include: { options: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProductVariantById(id: number) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: { options: true },
    });
    if (!variant) throw new Error("Product variant not found");
    return variant;
  },

  async updateProductVariant(id: number, data: UpdateProductVariantInput) {
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.hasMultipleOptions !== undefined) updateData.hasMultipleOptions = data.hasMultipleOptions;

    if (data.options) {
      await prisma.productVariantOption.deleteMany({ where: { variantId: id } });
      updateData.options = {
        create: data.options.map((optionName) => ({ name: optionName })),
      };
    }

    return prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: { options: true },
    });
  },

  async deleteProductVariant(id: number) {
    return prisma.productVariant.delete({ where: { id } });
  },
};
