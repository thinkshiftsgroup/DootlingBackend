import {
  createCategory,
  updateCategory,
  listCategories,
  deleteCategory,
} from "../category.service";
import { CategoryCreationData, CategoryUpdateData } from "../../types";
import prisma from "../../config/db";

// Mock dependencies
jest.mock("../../config/db");

const mockPrisma = {
  category: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  productCategory: {
    deleteMany: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("Category Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockCategoryId = 1;

  const mockCategory = {
    id: mockCategoryId,
    storeId: mockStoreId,
    name: "Test Category",
    description: "A test category",
    image: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoryWithProducts = {
    ...mockCategory,
    products: [
      { productId: 1 },
      { productId: 2 },
    ],
  };

  describe("createCategory", () => {
    it("should create a category with all fields", async () => {
      const createData: CategoryCreationData = {
        name: "Test Category",
        description: "A test category",
        image: "https://example.com/image.jpg",
      };

      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const result = await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Test Category",
          description: "A test category",
          image: "https://example.com/image.jpg",
          storeId: mockStoreId,
        },
      });

      expect(result).toEqual(mockCategory);
    });

    it("should create a category with only required fields", async () => {
      const createData: CategoryCreationData = {
        name: "Minimal Category",
      };

      const minimalCategory = { ...mockCategory, name: "Minimal Category", description: null, image: null };
      mockPrisma.category.create.mockResolvedValue(minimalCategory);

      const result = await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Minimal Category",
          description: undefined,
          image: undefined,
          storeId: mockStoreId,
        },
      });

      expect(result).toEqual(minimalCategory);
    });

    it("should create a category with only name and description", async () => {
      const createData: CategoryCreationData = {
        name: "Category with description",
        description: "Only description provided",
      };

      const categoryWithDescription = { ...mockCategory, name: "Category with description", image: null };
      mockPrisma.category.create.mockResolvedValue(categoryWithDescription);

      await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Category with description",
          description: "Only description provided",
          image: undefined,
          storeId: mockStoreId,
        },
      });
    });

    it("should create a category with only name and image", async () => {
      const createData: CategoryCreationData = {
        name: "Category with image",
        image: "https://example.com/new-image.jpg",
      };

      const categoryWithImage = { ...mockCategory, name: "Category with image", description: null };
      mockPrisma.category.create.mockResolvedValue(categoryWithImage);

      await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Category with image",
          description: undefined,
          image: "https://example.com/new-image.jpg",
          storeId: mockStoreId,
        },
      });
    });

    it("should handle empty description", async () => {
      const createData: CategoryCreationData = {
        name: "Empty Description Category",
        description: "",
      };

      const categoryWithEmptyDescription = { ...mockCategory, name: "Empty Description Category", description: "" };
      mockPrisma.category.create.mockResolvedValue(categoryWithEmptyDescription);

      await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Empty Description Category",
          description: "",
          image: undefined,
          storeId: mockStoreId,
        },
      });
    });

    it("should handle empty image", async () => {
      const createData: CategoryCreationData = {
        name: "Empty Image Category",
        image: "",
      };

      const categoryWithEmptyImage = { ...mockCategory, name: "Empty Image Category", image: "" };
      mockPrisma.category.create.mockResolvedValue(categoryWithEmptyImage);

      await createCategory(mockStoreId, createData);

      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: "Empty Image Category",
          description: undefined,
          image: "",
          storeId: mockStoreId,
        },
      });
    });
  });

  describe("updateCategory", () => {
    it("should update a category with all fields", async () => {
      const updateData: CategoryUpdateData = {
        name: "Updated Category",
        description: "Updated description",
        image: "https://example.com/updated-image.jpg",
      };

      const updatedCategory = { ...mockCategory, ...updateData };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const result = await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });

      expect(result).toEqual(updatedCategory);
    });

    it("should update only name", async () => {
      const updateData: CategoryUpdateData = {
        name: "New Name Only",
      };

      const updatedCategory = { ...mockCategory, name: "New Name Only" };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      const result = await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });

      expect(result).toEqual(updatedCategory);
    });

    it("should update only description", async () => {
      const updateData: CategoryUpdateData = {
        description: "New description only",
      };

      const updatedCategory = { ...mockCategory, description: "New description only" };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });
    });

    it("should update only image", async () => {
      const updateData: CategoryUpdateData = {
        image: "https://example.com/new-only-image.jpg",
      };

      const updatedCategory = { ...mockCategory, image: "https://example.com/new-only-image.jpg" };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });
    });

    it("should handle updating name and description only", async () => {
      const updateData: CategoryUpdateData = {
        name: "Name and Desc Update",
        description: "Updated description",
      };

      const updatedCategory = { ...mockCategory, ...updateData };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });
    });

    it("should handle empty update data", async () => {
      const updateData: CategoryUpdateData = {};

      mockPrisma.category.update.mockResolvedValue(mockCategory);

      const result = await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });

      expect(result).toEqual(mockCategory);
    });

    it("should handle setting description to empty string", async () => {
      const updateData: CategoryUpdateData = {
        description: "",
      };

      const updatedCategory = { ...mockCategory, description: "" };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });
    });

    it("should handle setting image to empty string", async () => {
      const updateData: CategoryUpdateData = {
        image: "",
      };

      const updatedCategory = { ...mockCategory, image: "" };
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      await updateCategory(mockStoreId, mockCategoryId, updateData);

      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
        data: updateData,
      });
    });
  });

  describe("listCategories", () => {
    const mockCategories = [mockCategoryWithProducts, { ...mockCategoryWithProducts, id: 2, name: "Category 2" }];

    it("should list categories with default pagination", async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(2);

      const result = await listCategories(mockStoreId);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
        },
        take: 10,
        skip: 0,
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

      expect(mockPrisma.category.count).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
        },
      });

      expect(result).toEqual({
        categories: mockCategories,
        meta: {
          totalCount: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      });
    });

    it("should list categories with custom pagination", async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(25);

      const result = await listCategories(mockStoreId, 2, 5);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
        },
        take: 5,
        skip: 5,
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

      expect(result.meta).toEqual({
        totalCount: 25,
        page: 2,
        pageSize: 5,
        totalPages: 5,
      });
    });

    it("should filter categories by name", async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategoryWithProducts]);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await listCategories(mockStoreId, 1, 10, { categoryName: "Test" });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: {
            contains: "Test",
            mode: "insensitive",
          },
        },
        take: 10,
        skip: 0,
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

      expect(result.categories).toHaveLength(1);
    });

    it("should handle case-insensitive name filtering", async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategoryWithProducts]);
      mockPrisma.category.count.mockResolvedValue(1);

      await listCategories(mockStoreId, 1, 10, { categoryName: "TEST CATEGORY" });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: {
            contains: "TEST CATEGORY",
            mode: "insensitive",
          },
        },
        take: 10,
        skip: 0,
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
    });

    it("should handle filtering with pagination", async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      await listCategories(mockStoreId, 3, 20, { categoryName: "nonexistent" });

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: {
            contains: "nonexistent",
            mode: "insensitive",
          },
        },
        take: 20,
        skip: 40,
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
    });

    it("should handle empty filter results", async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(0);

      const result = await listCategories(mockStoreId, 1, 10, { categoryName: "nonexistent" });

      expect(result.categories).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it("should handle categories without products", async () => {
      const categoriesWithoutProducts = [{ ...mockCategory, products: [] }];
      mockPrisma.category.findMany.mockResolvedValue(categoriesWithoutProducts);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await listCategories(mockStoreId);

      expect(result.categories[0].products).toEqual([]);
    });

    it("should handle categories with multiple products", async () => {
      const categoriesWithManyProducts = [{
        ...mockCategory,
        products: [
          { productId: 1 },
          { productId: 2 },
          { productId: 3 },
        ],
      }];
      mockPrisma.category.findMany.mockResolvedValue(categoriesWithManyProducts);
      mockPrisma.category.count.mockResolvedValue(1);

      const result = await listCategories(mockStoreId);

      expect(result.categories[0].products).toHaveLength(3);
    });

    it("should verify alphabetical ordering", async () => {
      const unsortedCategories = [
        { ...mockCategoryWithProducts, name: "Z Category" },
        { ...mockCategoryWithProducts, name: "A Category" },
        { ...mockCategoryWithProducts, name: "M Category" },
      ];
      mockPrisma.category.findMany.mockResolvedValue(unsortedCategories);
      mockPrisma.category.count.mockResolvedValue(3);

      await listCategories(mockStoreId);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        take: 10,
        skip: 0,
        orderBy: {
          name: "asc",
        },
        include: expect.any(Object),
      });
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category successfully", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({});
      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      await deleteCategory(mockStoreId, mockCategoryId);

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
      });
    });

    it("should handle deletion of non-existent category", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({});
      mockPrisma.category.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(deleteCategory(mockStoreId, mockCategoryId)).rejects.toThrow(
        "Record to delete does not exist"
      );

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
      });
    });

    it("should handle foreign key constraint errors", async () => {
      mockPrisma.productCategory.deleteMany.mockRejectedValue(
        new Error("Foreign key constraint violation")
      );

      await expect(deleteCategory(mockStoreId, mockCategoryId)).rejects.toThrow(
        "Foreign key constraint violation"
      );

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });

      expect(mockPrisma.category.delete).not.toHaveBeenCalled();
    });

    it("should handle database connection errors in product category deletion", async () => {
      mockPrisma.productCategory.deleteMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(deleteCategory(mockStoreId, mockCategoryId)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should handle database connection errors in category deletion", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({});
      mockPrisma.category.delete.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(deleteCategory(mockStoreId, mockCategoryId)).rejects.toThrow(
        "Database connection failed"
      );

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalled();
    });

    it("should handle deletion when category has no associated products", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      await deleteCategory(mockStoreId, mockCategoryId);

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
      });
    });

    it("should handle deletion when category has associated products", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      await deleteCategory(mockStoreId, mockCategoryId);

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { categoryId: mockCategoryId },
      });

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: {
          id: mockCategoryId,
          storeId: mockStoreId,
        },
      });
    });
  });
});
