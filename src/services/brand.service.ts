import { prisma } from "../prisma";

interface CreateBrandInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

interface UpdateBrandInput {
  name?: string;
  description?: string;
  imageUrl?: string;
}

interface GetBrandsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const brandService = {
  async createBrand(storeId: number, data: CreateBrandInput) {
    return prisma.brand.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    });
  },

  async getBrands(storeId: number, query: GetBrandsQuery) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.brand.count({ where }),
    ]);

    return {
      brands,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getAllBrands(storeId: number) {
    return prisma.brand.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getBrandById(id: number, storeId: number) {
    const brand = await prisma.brand.findFirst({ 
      where: { id, storeId } 
    });
    if (!brand) throw new Error("Brand not found or access denied");
    return brand;
  },

  async updateBrand(id: number, storeId: number, data: UpdateBrandInput) {
    // Verify ownership first
    const brand = await prisma.brand.findFirst({
      where: { id, storeId }
    });
    if (!brand) throw new Error("Brand not found or access denied");

    return prisma.brand.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
      },
    });
  },

  async deleteBrand(id: number, storeId: number) {
    // Verify ownership first
    const brand = await prisma.brand.findFirst({
      where: { id, storeId }
    });
    if (!brand) throw new Error("Brand not found or access denied");

    return prisma.brand.delete({ where: { id } });
  },
};
