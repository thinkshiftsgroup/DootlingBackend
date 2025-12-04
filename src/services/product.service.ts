import { prisma } from "../prisma";
import { Product } from "@prisma/client";
import { ProductCreationData, ProductUpdateData } from "src/types";
export const createProduct = async (
  storeId: number,
  data: ProductCreationData
): Promise<Product> => {
  const {
    pricings,
    descriptionDetails,
    options,
    categories,
    upsellProductIds = [],
    crossSellProductIds = [],
    ...productData
  } = data;

  // Validate categories exist if provided
  if (categories && categories.length > 0) {
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: categories },
        storeId: storeId,
      },
    });

    if (existingCategories.length !== categories.length) {
      throw new Error(
        "One or more category IDs do not exist or do not belong to this store"
      );
    }
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      storeId: storeId,

      pricings: {
        create: pricings.map((p) => ({
          currencyCode: p.currencyCode,
          sellingPrice: p.sellingPrice,
          originalPrice: p.originalPrice || null,
        })),
      },
      descriptionDetails: {
        create: descriptionDetails.map((d) => ({
          title: d.title,
          description: d.description,
        })),
      },
      options: {
        create: options.map((opt) => ({
          optionType: opt.optionType,
          values: opt.values,
        })),
      },

      categories:
        categories && categories.length > 0
          ? {
              create: categories.map((categoryId) => ({
                categoryId: categoryId,
              })),
            }
          : undefined,
      upsellProducts: {
        create: upsellProductIds.map((upsellProductId) => ({
          upsellProduct: {
            connect: { id: upsellProductId },
          },
        })),
      },
      crossSellProducts: {
        create: crossSellProductIds.map((crossSellProductId) => ({
          product: {
            connect: { id: crossSellProductId },
          },
        })),
      },
    },
    include: {
      pricings: true,
      descriptionDetails: true,
      options: true,
      categories: {
        include: { category: true },
      },
    },
  });

  return product;
};

export const isCustomProductUrlTaken = async (
  storeId: number,
  customProductUrl: string
): Promise<boolean> => {
  const count = await prisma.product.count({
    where: {
      storeId: storeId,
      customProductUrl: customProductUrl,
    },
  });

  return count > 0;
};

export const updateProduct = async (
  productId: number,
  storeId: number,
  data: ProductUpdateData
): Promise<Product> => {
  const {
    pricings,
    descriptionDetails,
    options,
    categories,
    upsellProductIds = [],
    crossSellProductIds = [],
    ...productData
  } = data;

  // Verify ownership first
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
    select: { storeId: true },
  });

  if (!product) {
    throw new Error("Product not found or access denied");
  }

  // Validate categories exist if provided
  if (categories && categories.length > 0) {
    const existingCategories = await prisma.category.findMany({
      where: {
        id: { in: categories },
        storeId: product.storeId,
      },
    });

    if (existingCategories.length !== categories.length) {
      throw new Error(
        "One or more category IDs do not exist or do not belong to this store"
      );
    }
  }

  const updatePayload: any = {
    ...productData,
  };

  if (pricings) {
    await prisma.productPricing.deleteMany({
      where: { productId: productId },
    });
    updatePayload.pricings = {
      create: pricings.map((p) => ({
        currencyCode: p.currencyCode,
        sellingPrice: p.sellingPrice,
        originalPrice: p.originalPrice || null,
      })),
    };
  }

  if (descriptionDetails) {
    await prisma.productDescriptionDetail.deleteMany({
      where: { productId: productId },
    });
    updatePayload.descriptionDetails = {
      create: descriptionDetails.map((d) => ({
        title: d.title,
        description: d.description,
      })),
    };
  }

  if (options) {
    await prisma.productOption.deleteMany({
      where: { productId: productId },
    });

    updatePayload.options = {
      create: options.map((opt) => ({
        optionType: opt.optionType,
        values: opt.values,
      })),
    };
  }

  if (categories && categories.length > 0) {
    await prisma.productCategory.deleteMany({
      where: { productId: productId },
    });
    updatePayload.categories = {
      create: categories.map((categoryId) => ({
        categoryId: categoryId,
      })),
    };
  }

  if (upsellProductIds || crossSellProductIds) {
    await prisma.productUpsell.deleteMany({
      where: { productId: productId },
    });

    const upsellCreates = (upsellProductIds || []).map((id) => ({
      upsellProductId: id,
    }));
    const crossSellCreates = (crossSellProductIds || []).map((id) => ({
      upsellProductId: id,
    }));

    updatePayload.upsellProducts = {
      create: [...upsellCreates, ...crossSellCreates],
    };
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: updatePayload,
    include: {
      pricings: true,
      descriptionDetails: true,
      options: true,
      categories: {
        include: { category: true },
      },
    },
  });

  return updatedProduct;
};

export const listProducts = async (
  storeId: number,
  page: number = 1,
  pageSize: number = 10,
  filters: {
    sortByPrice?: "highest" | "lowest";
    categoryId?: number;
    productName?: string;
  } = {}
) => {
  const skip = (page - 1) * pageSize;
  const { sortByPrice, categoryId, productName } = filters;

  const whereConditions: any = {
    storeId: storeId,
  };

  const orderByConditions: any = [];

  if (productName) {
    whereConditions.name = {
      contains: productName,
      mode: "insensitive",
    };
  }

  if (categoryId) {
    whereConditions.categories = {
      some: {
        categoryId: categoryId,
      },
    };
  }

  if (sortByPrice) {
    const direction = sortByPrice === "highest" ? "desc" : "asc";
    orderByConditions.push({
      pricings: {
        _max: {
          sellingPrice: direction,
        },
      },
    });
    orderByConditions.push({ id: direction });
  } else {
    orderByConditions.push({
      createdAt: "desc",
    });
  }

  const products = await prisma.product.findMany({
    where: whereConditions,
    take: pageSize,
    skip: skip,
    orderBy: orderByConditions,

    include: {
      pricings: true,
      categories: {
        include: { category: true },
      },
      options: true,
    },
  });

  const totalCount = await prisma.product.count({
    where: whereConditions,
  });

  return {
    products: products,
    meta: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};
export const getProductById = async (
  storeId: number,
  productId: number
): Promise<Product | null> => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      storeId: storeId,
    },
    include: {
      pricings: true,
      descriptionDetails: true,
      options: true,
      categories: {
        include: { category: true },
      },
      stockLots: true,
      stockAdjustments: true,
      stocks: true,
      internalTransfers: true,
      invoiceItems: true,
      upsellProducts: true,
      crossSellProducts: true,
    },
  });

  return product;
};
export const deleteProduct = async (
  productId: number,
  storeId: number
): Promise<void> => {
  // Verify ownership first
  const product = await prisma.product.findFirst({
    where: { id: productId, storeId },
  });
  if (!product) throw new Error("Product not found or access denied");

  await prisma.productCategory.deleteMany({
    where: { productId: productId },
  });

  await prisma.productUpsell.deleteMany({
    where: {
      OR: [{ productId: productId }, { upsellProductId: productId }],
    },
  });

  await prisma.product.delete({
    where: { id: productId },
  });
};
