import { Request, Response, RequestHandler } from "express";
import * as productService from "@services/product.service";
import { ProductCreationData, ProductUpdateData } from "src/types";
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

const getProductIdFromParams = (req: Request): number => {
  const productId = req.params.productId;
  if (!productId) {
    throw new Error("Product ID is required from request parameters.");
  }
  const id = parseInt(productId, 10);
  if (isNaN(id)) {
    throw new Error("Invalid Product ID format.");
  }
  return id;
};

export const createProductController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const productData: ProductCreationData = req.body;

    const newProduct = await productService.createProduct(storeId, productData);

    res.status(201).json({
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const getProductByIdController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const productId = getProductIdFromParams(req);

    const product = await productService.getProductById(storeId, productId);

    if (!product) {
      res.status(404).json({
        message: "Product not found.",
        data: null,
      });
      return;
    }

    res.status(200).json({
      message: "Product retrieved successfully.",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const validateProductUrlController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const { customProductUrl } = req.body as Pick<
      ProductCreationData,
      "customProductUrl"
    >;

    if (!customProductUrl) {
      res.status(400).json({
        message: "customProductUrl is required for validation.",
        isTaken: null,
      });
      return;
    }

    const isTaken = await productService.isCustomProductUrlTaken(
      storeId,
      customProductUrl
    );

    res.status(200).json({
      message: isTaken ? "URL is already taken." : "URL is available.",
      isTaken: isTaken,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      isTaken: null,
    });
  }
};

export const updateProductController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const productData: ProductUpdateData = req.body;

    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid Product ID.", data: null });
      return;
    }

    const storeId = req.store!.id;
    const updatedProduct = await productService.updateProduct(
      productId,
      storeId,
      productData
    );

    res.status(200).json({
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const listProductsController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const storeId = getStoreIdFromParams(req);
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
    const sortByPrice = req.query.sortByPrice as
      | "highest"
      | "lowest"
      | undefined;
    const categoryId = parseInt(req.query.categoryId as string, 10);
    const productName = req.query.productName as string | undefined;

    const filters = {
      sortByPrice,
      categoryId: isNaN(categoryId) ? undefined : categoryId,
      productName,
    };

    const result = await productService.listProducts(
      storeId,
      page,
      pageSize,
      filters
    );

    res.status(200).json({
      message: "Products retrieved successfully.",
      data: result.products,
      meta: result.meta,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};

export const deleteProductController: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = parseInt(req.params.productId, 10);

    if (isNaN(productId)) {
      res.status(400).json({ message: "Invalid Product ID.", data: null });
      return;
    }

    const storeId = req.store!.id;
    await productService.deleteProduct(productId, storeId);

    res.status(200).json({
      message: "Product deleted successfully.",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
      data: null,
    });
  }
};
