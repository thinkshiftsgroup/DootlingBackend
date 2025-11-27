import prisma from "@config/db";
import { Category } from "@prisma/client";
import { CategoryCreationData, CategoryUpdateData } from "src/types";

export const createCategory = async (
  storeId: number,
  data: CategoryCreationData
): Promise<Category> => {
  const newCategory = await prisma.category.create({
    data: {
      ...data,
      storeId: storeId,
    },
  });

  return newCategory;
};

export const updateCategory = async (
  storeId: number,
  categoryId: number,
  data: CategoryUpdateData
): Promise<Category> => {
  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
      storeId: storeId,
    },
    data: data,
  });

  return updatedCategory;
};

export const listCategories = async (
  storeId: number,
  page: number = 1,
  pageSize: number = 10,
  filters: { categoryName?: string } = {}
) => {
  const skip = (page - 1) * pageSize;
  const { categoryName } = filters;

  const whereConditions: any = {
    storeId: storeId,
  };

  if (categoryName) {
    whereConditions.name = {
      contains: categoryName,
      mode: "insensitive",
    };
  }

  const categories = await prisma.category.findMany({
    where: whereConditions,
    take: pageSize,
    skip: skip,
    orderBy: {
      name: "asc",
    },
    include: {
      products: {
        select: {
          productId: true,
        },
      },
    },
  });

  const totalCount = await prisma.category.count({
    where: whereConditions,
  });

  return {
    categories: categories,
    meta: {
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

export const deleteCategory = async (
  storeId: number,
  categoryId: number
): Promise<void> => {
  await prisma.productCategory.deleteMany({
    where: { categoryId: categoryId },
  });

  await prisma.category.delete({
    where: {
      id: categoryId,
      storeId: storeId,
    },
  });
};
