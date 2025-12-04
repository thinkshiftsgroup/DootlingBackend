import { prisma } from "../prisma";

interface VariantOption {
  name: string;
  isRequired?: boolean;
  affectsPrice?: boolean;
  additionalPrice?: number;
}

interface CreateProductVariantInput {
  name: string;
  hasMultipleOptions: boolean;
  options: VariantOption[];
}

interface UpdateProductVariantInput {
  name?: string;
  hasMultipleOptions?: boolean;
  options?: VariantOption[];
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
          create: data.options.map((option) => ({
            name: option.name,
            isRequired: option.isRequired || false,
            affectsPrice: option.affectsPrice || false,
            additionalPrice: option.additionalPrice || 0,
          })),
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

  async getProductVariantById(id: number, storeId: number) {
    const variant = await prisma.productVariant.findFirst({
      where: { id, storeId },
      include: { options: true },
    });
    if (!variant) throw new Error("Product variant not found or access denied");
    return variant;
  },

  async updateProductVariant(id: number, storeId: number, data: UpdateProductVariantInput) {
    // Verify ownership first
    const variant = await prisma.productVariant.findFirst({
      where: { id, storeId }
    });
    if (!variant) throw new Error("Product variant not found or access denied");

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.hasMultipleOptions !== undefined) updateData.hasMultipleOptions = data.hasMultipleOptions;

    if (data.options) {
      await prisma.productVariantOption.deleteMany({ where: { variantId: id } });
      updateData.options = {
        create: data.options.map((option) => ({
          name: option.name,
          isRequired: option.isRequired || false,
          affectsPrice: option.affectsPrice || false,
          additionalPrice: option.additionalPrice || 0,
        })),
      };
    }

    return prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: { options: true },
    });
  },

  async deleteProductVariant(id: number, storeId: number) {
    // Verify ownership first
    const variant = await prisma.productVariant.findFirst({
      where: { id, storeId }
    });
    if (!variant) throw new Error("Product variant not found or access denied");

    return prisma.productVariant.delete({ where: { id } });
  },
};
