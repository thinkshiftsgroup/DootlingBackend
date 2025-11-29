import { brandService } from "../brand.service";
import { prisma } from "../../prisma";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  brand: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("Brand Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockBrandId = 1;

  const mockBrand = {
    id: mockBrandId,
    storeId: mockStoreId,
    name: "Test Brand",
    description: "A test brand",
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createBrand", () => {
    it("should create a brand with all fields", async () => {
      const createData = {
        name: "Test Brand",
        description: "A test brand",
        imageUrl: "https://example.com/image.jpg",
      };

      mockPrisma.brand.create.mockResolvedValue(mockBrand);

      const result = await brandService.createBrand(mockStoreId, createData);

      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Test Brand",
          description: "A test brand",
          imageUrl: "https://example.com/image.jpg",
        },
      });

      expect(result).toEqual(mockBrand);
    });

    it("should create a brand with only required fields", async () => {
      const createData = {
        name: "Minimal Brand",
      };

      const minimalBrand = { ...mockBrand, name: "Minimal Brand", description: null, imageUrl: null };
      mockPrisma.brand.create.mockResolvedValue(minimalBrand);

      const result = await brandService.createBrand(mockStoreId, createData);

      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Minimal Brand",
          description: undefined,
          imageUrl: undefined,
        },
      });

      expect(result).toEqual(minimalBrand);
    });

    it("should create a brand with only name and description", async () => {
      const createData = {
        name: "Brand with description",
        description: "Only description provided",
      };

      const brandWithDescription = { ...mockBrand, name: "Brand with description", imageUrl: null };
      mockPrisma.brand.create.mockResolvedValue(brandWithDescription);

      await brandService.createBrand(mockStoreId, createData);

      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Brand with description",
          description: "Only description provided",
          imageUrl: undefined,
        },
      });
    });

    it("should create a brand with only name and image", async () => {
      const createData = {
        name: "Brand with image",
        imageUrl: "https://example.com/new-image.jpg",
      };

      const brandWithImage = { ...mockBrand, name: "Brand with image", description: null };
      mockPrisma.brand.create.mockResolvedValue(brandWithImage);

      await brandService.createBrand(mockStoreId, createData);

      expect(mockPrisma.brand.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Brand with image",
          description: undefined,
          imageUrl: "https://example.com/new-image.jpg",
        },
      });
    });
  });

  describe("getBrands", () => {
    const mockBrands = [mockBrand, { ...mockBrand, id: 2, name: "Brand 2" }];

    it("should get brands with default pagination", async () => {
      mockPrisma.brand.findMany.mockResolvedValue(mockBrands);
      mockPrisma.brand.count.mockResolvedValue(2);

      const result = await brandService.getBrands(mockStoreId, {});

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(mockPrisma.brand.count).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
      });

      expect(result).toEqual({
        brands: mockBrands,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should get brands with custom pagination", async () => {
      mockPrisma.brand.findMany.mockResolvedValue(mockBrands);
      mockPrisma.brand.count.mockResolvedValue(25);

      const result = await brandService.getBrands(mockStoreId, {
        page: 2,
        limit: 5,
      });

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 5,
        take: 5,
        orderBy: { createdAt: "desc" },
      });

      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });
    });

    it("should search brands by name", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([mockBrand]);
      mockPrisma.brand.count.mockResolvedValue(1);

      const result = await brandService.getBrands(mockStoreId, {
        search: "Test",
      });

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "Test", mode: "insensitive" } },
            { description: { contains: "Test", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(result.brands).toHaveLength(1);
    });

    it("should search brands by description", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([mockBrand]);
      mockPrisma.brand.count.mockResolvedValue(1);

      await brandService.getBrands(mockStoreId, {
        search: "test brand",
      });

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "test brand", mode: "insensitive" } },
            { description: { contains: "test brand", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle search with pagination", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([]);
      mockPrisma.brand.count.mockResolvedValue(0);

      await brandService.getBrands(mockStoreId, {
        search: "nonexistent",
        page: 3,
        limit: 20,
      });

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "nonexistent", mode: "insensitive" } },
            { description: { contains: "nonexistent", mode: "insensitive" } },
          ],
        },
        skip: 40,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle empty search results", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([]);
      mockPrisma.brand.count.mockResolvedValue(0);

      const result = await brandService.getBrands(mockStoreId, {
        search: "nonexistent",
      });

      expect(result.brands).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("should handle case-insensitive search", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([mockBrand]);
      mockPrisma.brand.count.mockResolvedValue(1);

      await brandService.getBrands(mockStoreId, {
        search: "TEST BRAND",
      });

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "TEST BRAND", mode: "insensitive" } },
            { description: { contains: "TEST BRAND", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getAllBrands", () => {
    it("should get all brands for a store", async () => {
      const allBrands = [mockBrand, { ...mockBrand, id: 2 }, { ...mockBrand, id: 3 }];
      mockPrisma.brand.findMany.mockResolvedValue(allBrands);

      const result = await brandService.getAllBrands(mockStoreId);

      expect(mockPrisma.brand.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toEqual(allBrands);
    });

    it("should handle empty brands list", async () => {
      mockPrisma.brand.findMany.mockResolvedValue([]);

      const result = await brandService.getAllBrands(mockStoreId);

      expect(result).toEqual([]);
    });

    it("should return brands ordered by creation date", async () => {
      const brands = [
        { ...mockBrand, id: 3, createdAt: new Date("2023-01-01") },
        { ...mockBrand, id: 2, createdAt: new Date("2023-02-01") },
        { ...mockBrand, id: 1, createdAt: new Date("2023-03-01") },
      ];
      mockPrisma.brand.findMany.mockResolvedValue(brands);

      const result = await brandService.getAllBrands(mockStoreId);

      expect(result).toEqual(brands);
    });
  });

  describe("getBrandById", () => {
    it("should get a brand by id successfully", async () => {
      mockPrisma.brand.findUnique.mockResolvedValue(mockBrand);

      const result = await brandService.getBrandById(mockBrandId);

      expect(mockPrisma.brand.findUnique).toHaveBeenCalledWith({
        where: { id: mockBrandId },
      });

      expect(result).toEqual(mockBrand);
    });

    it("should throw error when brand not found", async () => {
      mockPrisma.brand.findUnique.mockResolvedValue(null);

      await expect(brandService.getBrandById(mockBrandId)).rejects.toThrow(
        "Brand not found"
      );

      expect(mockPrisma.brand.findUnique).toHaveBeenCalledWith({
        where: { id: mockBrandId },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.brand.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(brandService.getBrandById(mockBrandId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("updateBrand", () => {
    it("should update all fields of a brand", async () => {
      const updateData = {
        name: "Updated Brand",
        description: "Updated description",
        imageUrl: "https://example.com/updated-image.jpg",
      };

      const updatedBrand = { ...mockBrand, ...updateData };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      const result = await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          name: "Updated Brand",
          description: "Updated description",
          imageUrl: "https://example.com/updated-image.jpg",
        },
      });

      expect(result).toEqual(updatedBrand);
    });

    it("should update only name", async () => {
      const updateData = { name: "New Name Only" };

      const updatedBrand = { ...mockBrand, name: "New Name Only" };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      const result = await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          name: "New Name Only",
        },
      });

      expect(result).toEqual(updatedBrand);
    });

    it("should update only description", async () => {
      const updateData = { description: "New description only" };

      const updatedBrand = { ...mockBrand, description: "New description only" };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          description: "New description only",
        },
      });
    });

    it("should update only image URL", async () => {
      const updateData = { imageUrl: "https://example.com/new-only-image.jpg" };

      const updatedBrand = { ...mockBrand, imageUrl: "https://example.com/new-only-image.jpg" };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          imageUrl: "https://example.com/new-only-image.jpg",
        },
      });
    });

    it("should handle setting description to empty string", async () => {
      const updateData = { description: "" };

      const updatedBrand = { ...mockBrand, description: "" };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          description: "",
        },
      });
    });

    it("should handle setting description to undefined", async () => {
      const updateData = { description: undefined };

      const updatedBrand = { ...mockBrand, description: undefined };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          description: undefined,
        },
      });
    });

    it("should handle updating name and description only", async () => {
      const updateData = {
        name: "Name and Desc Update",
        description: "Updated description",
      };

      const updatedBrand = { ...mockBrand, ...updateData };
      mockPrisma.brand.update.mockResolvedValue(updatedBrand);

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          name: "Name and Desc Update",
          description: "Updated description",
        },
      });
    });

    it("should handle empty update data", async () => {
      const updateData = {};

      mockPrisma.brand.update.mockResolvedValue(mockBrand);

      const result = await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {},
      });

      expect(result).toEqual(mockBrand);
    });

    it("should not update imageUrl when not provided", async () => {
      const updateData = { name: "Name only" };

      await brandService.updateBrand(mockBrandId, updateData);

      expect(mockPrisma.brand.update).toHaveBeenCalledWith({
        where: { id: mockBrandId },
        data: {
          name: "Name only",
        },
      });
    });
  });

  describe("deleteBrand", () => {
    it("should delete a brand successfully", async () => {
      mockPrisma.brand.delete.mockResolvedValue(mockBrand);

      const result = await brandService.deleteBrand(mockBrandId);

      expect(mockPrisma.brand.delete).toHaveBeenCalledWith({
        where: { id: mockBrandId },
      });

      expect(result).toEqual(mockBrand);
    });

    it("should handle deletion of non-existent brand", async () => {
      mockPrisma.brand.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(brandService.deleteBrand(mockBrandId)).rejects.toThrow(
        "Record to delete does not exist"
      );

      expect(mockPrisma.brand.delete).toHaveBeenCalledWith({
        where: { id: mockBrandId },
      });
    });

    it("should handle foreign key constraint errors", async () => {
      mockPrisma.brand.delete.mockRejectedValue(
        new Error("Foreign key constraint violation")
      );

      await expect(brandService.deleteBrand(mockBrandId)).rejects.toThrow(
        "Foreign key constraint violation"
      );
    });

    it("should handle database connection errors", async () => {
      mockPrisma.brand.delete.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(brandService.deleteBrand(mockBrandId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });
});
