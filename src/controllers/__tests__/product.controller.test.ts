import {
  createProductController,
  updateProductController,
  listProductsController,
  deleteProductController,
} from "../product.controller";
import * as productService from "../../services/product.service";
import { Request, Response, NextFunction } from "express";
import { ProductCreationData, ProductUpdateData } from "../../types";

// Mock dependencies
jest.mock("../../services/product.service");

const mockProductService = productService as jest.Mocked<typeof productService>;

describe("Product Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  const mockStoreId = "1";
  const mockProductId = "123";
  const mockProduct = {
    id: 123,
    name: "Test Product",
    description: "A test product",
    price: 29.99,
    storeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    type: "REGULAR" as const,
    productImages: ["image1.jpg"],
    shortDescription: "A test product",
    stockQuantity: 100,
    longDescription: null,
    customProductUrl: null,
    seoDescription: null,
    checkoutButtonCta: null,
    hideFromHomepage: false,
    unit: null,
    barcode: null,
    minOrderQuantity: 0,
    maxOrderQuantity: 0,
    isPreOrder: false,
    preOrderReleaseDate: null,
    showStrikedOutOriginalPrice: false,
    embedVideoPath: null,
    discoveryCategories: [],
    commissionPercentage: null,
    autoRedirectAfterPurchase: false,
    redirectUrl: null,
    pricings: [{
      id: 1,
      productId: 123,
      currencyCode: "USD",
      sellingPrice: 29.99,
      originalPrice: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
    categories: [{
      id: 1,
      productId: 123,
      categoryId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: 1,
        name: "Test Category",
        description: null,
        image: null,
        storeId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }],
    options: [{
      id: 1,
      productId: 123,
      optionType: "Size",
      values: ["S", "M", "L"],
      createdAt: new Date(),
      updatedAt: new Date(),
    }],
  };

  describe("createProductController", () => {
    it("should create a product successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      mockProductService.createProduct.mockResolvedValue(mockProduct);

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.createProduct).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Product created successfully.",
        data: mockProduct,
      });
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID format", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      mockProductService.createProduct.mockRejectedValue(new Error("Service error"));

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle empty store ID string", async () => {
      mockRequest.params = { storeId: "" };
      mockRequest.body = {
        name: "Test Product",
        productImages: ["image1.jpg"],
        shortDescription: "A test product",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 29.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductCreationData;

      await createProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });
  });

  describe("updateProductController", () => {
    it("should update a product successfully", async () => {
      mockRequest.params = { productId: mockProductId };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      const updatedProduct = { ...mockProduct, name: "Updated Product", price: 39.99 };
      mockProductService.updateProduct.mockResolvedValue(updatedProduct);

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.updateProduct).toHaveBeenCalledWith(123, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Product updated successfully.",
        data: updatedProduct,
      });
    });

    it("should handle invalid product ID", async () => {
      mockRequest.params = { productId: "invalid" };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
      expect(mockProductService.updateProduct).not.toHaveBeenCalled();
    });

    it("should handle missing product ID", async () => {
      mockRequest.params = {};
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle NaN product ID", async () => {
      mockRequest.params = { productId: "NaN" };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { productId: mockProductId };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      mockProductService.updateProduct.mockRejectedValue(new Error("Service error"));

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle empty product ID string", async () => {
      mockRequest.params = { productId: "" };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle decimal product ID", async () => {
      mockRequest.params = { productId: "123.45" };
      mockRequest.body = {
        name: "Updated Product",
        productImages: ["image1.jpg"],
        shortDescription: "Updated description",
        stockQuantity: 100,
        type: "REGULAR",
        pricings: [{
          currencyCode: "USD",
          sellingPrice: 39.99,
        }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      } as ProductUpdateData;

      mockProductService.updateProduct.mockRejectedValue(new Error("Invalid product ID"));

      await updateProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("listProductsController", () => {
    const mockProductsResult = {
      products: [mockProduct],
      meta: {
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    it("should list products with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Products retrieved successfully.",
        data: [mockProduct],
        meta: mockProductsResult.meta,
      });
    });

    it("should list products with custom pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "2",
        pageSize: "5",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 2, 5, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should list products with price sorting", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        sortByPrice: "highest",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: "highest",
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should list products with category filter", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        categoryId: "5",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: 5,
        productName: undefined,
      });
    });

    it("should list products with name filter", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        productName: "Test Product",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: "Test Product",
      });
    });

    it("should list products with all filters", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "3",
        pageSize: "20",
        sortByPrice: "lowest",
        categoryId: "10",
        productName: "Special Product",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 3, 20, {
        sortByPrice: "lowest",
        categoryId: 10,
        productName: "Special Product",
      });
    });

    it("should handle invalid category ID", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        categoryId: "invalid",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should handle invalid pageSize", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        pageSize: "invalid",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.query = {};

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductService.listProducts.mockRejectedValue(new Error("Service error"));

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle zero page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "0",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, 1, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });

    it("should handle negative page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "-5",
      };

      mockProductService.listProducts.mockResolvedValue(mockProductsResult);

      await listProductsController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.listProducts).toHaveBeenCalledWith(1, -5, 10, {
        sortByPrice: undefined,
        categoryId: undefined,
        productName: undefined,
      });
    });
  });

  describe("deleteProductController", () => {
    it("should delete a product successfully", async () => {
      mockRequest.params = { productId: mockProductId };

      mockProductService.deleteProduct.mockResolvedValue(undefined);

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Product deleted successfully.",
        data: null,
      });
    });

    it("should handle invalid product ID", async () => {
      mockRequest.params = { productId: "invalid" };

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
      expect(mockProductService.deleteProduct).not.toHaveBeenCalled();
    });

    it("should handle missing product ID", async () => {
      mockRequest.params = {};

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle NaN product ID", async () => {
      mockRequest.params = { productId: "NaN" };

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { productId: mockProductId };

      mockProductService.deleteProduct.mockRejectedValue(new Error("Service error"));

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle empty product ID string", async () => {
      mockRequest.params = { productId: "" };

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Product ID.",
        data: null,
      });
    });

    it("should handle decimal product ID", async () => {
      mockRequest.params = { productId: "123.45" };

      mockProductService.deleteProduct.mockRejectedValue(new Error("Invalid product ID"));

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle zero product ID", async () => {
      mockRequest.params = { productId: "0" };

      mockProductService.deleteProduct.mockResolvedValue(undefined);

      await deleteProductController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductService.deleteProduct).toHaveBeenCalledWith(0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
