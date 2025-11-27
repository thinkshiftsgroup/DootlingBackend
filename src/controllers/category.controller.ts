import { Request, Response, RequestHandler } from "express";
import * as categoryService from "@services/category.service";
import { CategoryCreationData, CategoryUpdateData } from "src/types";

const getStoreIdFromParams = (req: Request): number => {
  const storeId = req.params.storeId;
  if (!storeId) {
    throw new Error("Store ID is required from request parameters.");
  }
  const id = parseInt(storeId, 10);
  if (isNaN(id)) {
    throw new Error("Invalid Store ID format.");
  }
  return id;
};

export const createCategoryController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const categoryData: CategoryCreationData = req.body;

    const newCategory = await categoryService.createCategory(
      storeId,
      categoryData
    );

    res.status(201).json({
      message: "Category created successfully.",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const updateCategoryController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const categoryId = parseInt(req.params.categoryId, 10);
    const categoryData: CategoryUpdateData = req.body;

    if (isNaN(categoryId)) {
      res.status(400).json({ message: "Invalid Category ID.", data: null });
      return;
    }

    const updatedCategory = await categoryService.updateCategory(
      storeId,
      categoryId,
      categoryData
    );

    res.status(200).json({
      message: "Category updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const listCategoriesController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const categoryName = req.query.categoryName as string | undefined;

    const filters = {
      categoryName,
    };

    const result = await categoryService.listCategories(
      storeId,
      page,
      pageSize,
      filters
    );

    res.status(200).json({
      message: "Categories retrieved successfully.",
      data: result.categories,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const deleteCategoryController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const categoryId = parseInt(req.params.categoryId, 10);

    if (isNaN(categoryId)) {
      res.status(400).json({ message: "Invalid Category ID.", data: null });
      return;
    }

    await categoryService.deleteCategory(storeId, categoryId);

    res.status(200).json({
      message: "Category deleted successfully.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};
