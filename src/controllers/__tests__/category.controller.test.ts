import {
  createCategoryController,
  updateCategoryController,
  listCategoriesController,
  deleteCategoryController,
} from "../category.controller";
import * as categoryService from "../../services/category.service";
import { Request, Response, NextFunction } from "express";
import { CategoryCreationData, CategoryUpdateData } from "../../types";

// Mock dependencies
jest.mock("../../services/category.service");

const mockCategoryService = categoryService as jest.Mocked<typeof categoryService>;

describe("Category Controller", () => {
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
  const mockCategoryId = "123";
  const mockCategory = {
    id: 123,
    name: "Test Category",
    description: "A test category",
    image: "https://example.com/image.jpg",
    storeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [{ productId: 1 }],
  };

  describe("createCategoryController", () => {
    it("should create a category successfully with all fields", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Category",
        description: "A test category",
        image: "https://example.com/image.jpg",
      } as CategoryCreationData;

      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category created successfully.",
        data: mockCategory,
      });
    });

    it("should create a category with only required fields", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Minimal Category",
      } as CategoryCreationData;

      const minimalCategory = { ...mockCategory, name: "Minimal Category", description: null, image: null };
      mockCategoryService.createCategory.mockResolvedValue(minimalCategory);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category created successfully.",
        data: minimalCategory,
      });
    });

    it("should create a category with only name and description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Category with description",
        description: "Only description provided",
      } as CategoryCreationData;

      const categoryWithDescription = { ...mockCategory, name: "Category with description", image: null };
      mockCategoryService.createCategory.mockResolvedValue(categoryWithDescription);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
    });

    it("should create a category with only name and image", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Category with image",
        image: "https://example.com/new-image.jpg",
      } as CategoryCreationData;

      const categoryWithImage = { ...mockCategory, name: "Category with image", description: null };
      mockCategoryService.createCategory.mockResolvedValue(categoryWithImage);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
    });

    it("should handle empty description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Empty Description Category",
        description: "",
      } as CategoryCreationData;

      const categoryWithEmptyDescription = { ...mockCategory, name: "Empty Description Category", description: "" };
      mockCategoryService.createCategory.mockResolvedValue(categoryWithEmptyDescription);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
    });

    it("should handle empty image", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Empty Image Category",
        image: "",
      } as CategoryCreationData;

      const categoryWithEmptyImage = { ...mockCategory, name: "Empty Image Category", image: "" };
      mockCategoryService.createCategory.mockResolvedValue(categoryWithEmptyImage);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(1, mockRequest.body);
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = {} as CategoryCreationData;

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID format", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.body = {} as CategoryCreationData;

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = {} as CategoryCreationData;

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle empty store ID string", async () => {
      mockRequest.params = { storeId: "" };
      mockRequest.body = {} as CategoryCreationData;

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {} as CategoryCreationData;

      mockCategoryService.createCategory.mockRejectedValue(new Error("Service error"));

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle zero store ID", async () => {
      mockRequest.params = { storeId: "0" };
      mockRequest.body = {} as CategoryCreationData;

      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await createCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith(0, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });
  });

  describe("updateCategoryController", () => {
    it("should update a category successfully with all fields", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        name: "Updated Category",
        description: "Updated description",
        image: "https://example.com/updated-image.jpg",
      } as CategoryUpdateData;

      const updatedCategory = { ...mockCategory, ...mockRequest.body };
      mockCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category updated successfully.",
        data: updatedCategory,
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        name: "New Name Only",
      } as CategoryUpdateData;

      const nameUpdatedCategory = { ...mockCategory, name: "New Name Only" };
      mockCategoryService.updateCategory.mockResolvedValue(nameUpdatedCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should update only description", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        description: "New description only",
      } as CategoryUpdateData;

      const descUpdatedCategory = { ...mockCategory, description: "New description only" };
      mockCategoryService.updateCategory.mockResolvedValue(descUpdatedCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should update only image", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        image: "https://example.com/new-only-image.jpg",
      } as CategoryUpdateData;

      const imageUpdatedCategory = { ...mockCategory, image: "https://example.com/new-only-image.jpg" };
      mockCategoryService.updateCategory.mockResolvedValue(imageUpdatedCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should handle updating name and description only", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        name: "Name and Desc Update",
        description: "Updated description",
      } as CategoryUpdateData;

      const updatedCategory = { ...mockCategory, ...mockRequest.body };
      mockCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should handle empty update data", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {} as CategoryUpdateData;

      mockCategoryService.updateCategory.mockResolvedValue(mockCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should handle setting description to empty string", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        description: "",
      } as CategoryUpdateData;

      const emptyDescCategory = { ...mockCategory, description: "" };
      mockCategoryService.updateCategory.mockResolvedValue(emptyDescCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should handle setting image to empty string", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {
        image: "",
      } as CategoryUpdateData;

      const emptyImageCategory = { ...mockCategory, image: "" };
      mockCategoryService.updateCategory.mockResolvedValue(emptyImageCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should handle invalid category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "invalid" };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
      expect(mockCategoryService.updateCategory).not.toHaveBeenCalled();
    });

    it("should handle missing category ID", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle NaN category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "NaN" };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle empty category ID string", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "" };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle decimal category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "123.45" };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 123, mockRequest.body);
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = { categoryId: mockCategoryId };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid", categoryId: mockCategoryId };
      mockRequest.body = {} as CategoryUpdateData;

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };
      mockRequest.body = {} as CategoryUpdateData;

      mockCategoryService.updateCategory.mockRejectedValue(new Error("Service error"));

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle zero category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "0" };
      mockRequest.body = {} as CategoryUpdateData;

      mockCategoryService.updateCategory.mockResolvedValue(mockCategory);

      await updateCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, 0, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });

  describe("listCategoriesController", () => {
    const mockCategoriesResult = {
      categories: [mockCategory],
      meta: {
        totalCount: 1,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    };

    it("should list categories with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Categories retrieved successfully.",
        data: [mockCategory],
        meta: mockCategoriesResult.meta,
      });
    });

    it("should list categories with custom pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "2",
        pageSize: "5",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 2, 5, {
        categoryName: undefined,
      });
    });

    it("should list categories with category name filter", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        categoryName: "Test Category",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: "Test Category",
      });
    });

    it("should list categories with all filters", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "3",
        pageSize: "20",
        categoryName: "Special Category",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 3, 20, {
        categoryName: "Special Category",
      });
    });

    it("should handle empty category name filter", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        categoryName: "",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: "",
      });
    });

    it("should handle case-insensitive category name filter", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        categoryName: "TEST CATEGORY",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: "TEST CATEGORY",
      });
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: undefined,
      });
    });

    it("should handle invalid pageSize", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        pageSize: "invalid",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: undefined,
      });
    });

    it("should handle zero page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "0",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: undefined,
      });
    });

    it("should handle negative page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "-5",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, -5, 10, {
        categoryName: undefined,
      });
    });

    it("should handle zero pageSize", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        pageSize: "0",
      };

      mockCategoryService.listCategories.mockResolvedValue(mockCategoriesResult);

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.listCategories).toHaveBeenCalledWith(1, 1, 10, {
        categoryName: undefined,
      });
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.query = {};

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockCategoryService.listCategories.mockRejectedValue(new Error("Service error"));

      await listCategoriesController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });
  });

  describe("deleteCategoryController", () => {
    it("should delete a category successfully", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };

      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1, 123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Category deleted successfully.",
        data: null,
      });
    });

    it("should handle invalid category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "invalid" };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
      expect(mockCategoryService.deleteCategory).not.toHaveBeenCalled();
    });

    it("should handle missing category ID", async () => {
      mockRequest.params = { storeId: mockStoreId };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle NaN category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "NaN" };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle empty category ID string", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "" };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Category ID.",
        data: null,
      });
    });

    it("should handle decimal category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "123.45" };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1, 123);
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = { categoryId: mockCategoryId };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Store ID is required from request parameters.",
        data: null,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid", categoryId: mockCategoryId };

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid Store ID format.",
        data: null,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: mockCategoryId };

      mockCategoryService.deleteCategory.mockRejectedValue(new Error("Service error"));

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Service error",
        data: null,
      });
    });

    it("should handle zero category ID", async () => {
      mockRequest.params = { storeId: mockStoreId, categoryId: "0" };

      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(1, 0);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it("should handle zero store ID", async () => {
      mockRequest.params = { storeId: "0", categoryId: mockCategoryId };

      mockCategoryService.deleteCategory.mockResolvedValue(undefined);

      await deleteCategoryController(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(0, 123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
  });
});
