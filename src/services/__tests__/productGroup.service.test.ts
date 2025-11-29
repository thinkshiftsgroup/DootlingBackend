import { productGroupService } from "../productGroup.service";
import { prisma } from "../../prisma";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  productGroup: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("ProductGroup Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockGroupId = 1;

  const mockGroup = {
    id: mockGroupId,
    storeId: mockStoreId,
    name: "Test Group",
    description: "A test product group",
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createProductGroup", () => {
    it("should create a product group with all fields", async () => {
      const createData = {
        name: "Test Group",
        description: "A test product group",
        imageUrl: "https://example.com/image.jpg",
      };

      mockPrisma.productGroup.create.mockResolvedValue(mockGroup);

      const result = await productGroupService.createProductGroup(mockStoreId, createData);

      expect(mockPrisma.productGroup.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Test Group",
          description: "A test product group",
          imageUrl: "https://example.com/image.jpg",
        },
      });

      expect(result).toEqual(mockGroup);
    });

    it("should create a product group with only required fields", async () => {
      const createData = {
        name: "Minimal Group",
      };

      const minimalGroup = { ...mockGroup, name: "Minimal Group", description: null, imageUrl: null };
      mockPrisma.productGroup.create.mockResolvedValue(minimalGroup);

      const result = await productGroupService.createProductGroup(mockStoreId, createData);

      expect(mockPrisma.productGroup.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Minimal Group",
          description: undefined,
          imageUrl: undefined,
        },
      });

      expect(result).toEqual(minimalGroup);
    });

    it("should create a product group with only name and description", async () => {
      const createData = {
        name: "Group with description",
        description: "Only description provided",
      };

      const groupWithDescription = { ...mockGroup, name: "Group with description", imageUrl: null };
      mockPrisma.productGroup.create.mockResolvedValue(groupWithDescription);

      await productGroupService.createProductGroup(mockStoreId, createData);

      expect(mockPrisma.productGroup.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Group with description",
          description: "Only description provided",
          imageUrl: undefined,
        },
      });
    });

    it("should create a product group with only name and image", async () => {
      const createData = {
        name: "Group with image",
        imageUrl: "https://example.com/new-image.jpg",
      };

      const groupWithImage = { ...mockGroup, name: "Group with image", description: null };
      mockPrisma.productGroup.create.mockResolvedValue(groupWithImage);

      await productGroupService.createProductGroup(mockStoreId, createData);

      expect(mockPrisma.productGroup.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Group with image",
          description: undefined,
          imageUrl: "https://example.com/new-image.jpg",
        },
      });
    });
  });

  describe("getProductGroups", () => {
    const mockGroups = [mockGroup, { ...mockGroup, id: 2, name: "Group 2" }];

    it("should get product groups with default pagination", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue(mockGroups);
      mockPrisma.productGroup.count.mockResolvedValue(2);

      const result = await productGroupService.getProductGroups(mockStoreId, {});

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(mockPrisma.productGroup.count).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
      });

      expect(result).toEqual({
        groups: mockGroups,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should get product groups with custom pagination", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue(mockGroups);
      mockPrisma.productGroup.count.mockResolvedValue(25);

      const result = await productGroupService.getProductGroups(mockStoreId, {
        page: 2,
        limit: 5,
      });

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
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

    it("should search product groups by name", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue([mockGroup]);
      mockPrisma.productGroup.count.mockResolvedValue(1);

      const result = await productGroupService.getProductGroups(mockStoreId, {
        search: "Test",
      });

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
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

      expect(result.groups).toHaveLength(1);
    });

    it("should search product groups by description", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue([mockGroup]);
      mockPrisma.productGroup.count.mockResolvedValue(1);

      await productGroupService.getProductGroups(mockStoreId, {
        search: "test product",
      });

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "test product", mode: "insensitive" } },
            { description: { contains: "test product", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle search with pagination", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue([]);
      mockPrisma.productGroup.count.mockResolvedValue(0);

      await productGroupService.getProductGroups(mockStoreId, {
        search: "nonexistent",
        page: 3,
        limit: 20,
      });

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
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
      mockPrisma.productGroup.findMany.mockResolvedValue([]);
      mockPrisma.productGroup.count.mockResolvedValue(0);

      const result = await productGroupService.getProductGroups(mockStoreId, {
        search: "nonexistent",
      });

      expect(result.groups).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("should handle case-insensitive search", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue([mockGroup]);
      mockPrisma.productGroup.count.mockResolvedValue(1);

      await productGroupService.getProductGroups(mockStoreId, {
        search: "TEST GROUP",
      });

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          OR: [
            { name: { contains: "TEST GROUP", mode: "insensitive" } },
            { description: { contains: "TEST GROUP", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getAllProductGroups", () => {
    it("should get all product groups for a store", async () => {
      const allGroups = [mockGroup, { ...mockGroup, id: 2 }, { ...mockGroup, id: 3 }];
      mockPrisma.productGroup.findMany.mockResolvedValue(allGroups);

      const result = await productGroupService.getAllProductGroups(mockStoreId);

      expect(mockPrisma.productGroup.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toEqual(allGroups);
    });

    it("should handle empty groups list", async () => {
      mockPrisma.productGroup.findMany.mockResolvedValue([]);

      const result = await productGroupService.getAllProductGroups(mockStoreId);

      expect(result).toEqual([]);
    });

    it("should return groups ordered by creation date", async () => {
      const groups = [
        { ...mockGroup, id: 3, createdAt: new Date("2023-01-01") },
        { ...mockGroup, id: 2, createdAt: new Date("2023-02-01") },
        { ...mockGroup, id: 1, createdAt: new Date("2023-03-01") },
      ];
      mockPrisma.productGroup.findMany.mockResolvedValue(groups);

      const result = await productGroupService.getAllProductGroups(mockStoreId);

      expect(result).toEqual(groups);
    });
  });

  describe("getProductGroupById", () => {
    it("should get a product group by id successfully", async () => {
      mockPrisma.productGroup.findUnique.mockResolvedValue(mockGroup);

      const result = await productGroupService.getProductGroupById(mockGroupId);

      expect(mockPrisma.productGroup.findUnique).toHaveBeenCalledWith({
        where: { id: mockGroupId },
      });

      expect(result).toEqual(mockGroup);
    });

    it("should throw error when product group not found", async () => {
      mockPrisma.productGroup.findUnique.mockResolvedValue(null);

      await expect(productGroupService.getProductGroupById(mockGroupId)).rejects.toThrow(
        "Product group not found"
      );

      expect(mockPrisma.productGroup.findUnique).toHaveBeenCalledWith({
        where: { id: mockGroupId },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.productGroup.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(productGroupService.getProductGroupById(mockGroupId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("updateProductGroup", () => {
    it("should update all fields of a product group", async () => {
      const updateData = {
        name: "Updated Group",
        description: "Updated description",
        imageUrl: "https://example.com/updated-image.jpg",
      };

      const updatedGroup = { ...mockGroup, ...updateData };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      const result = await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          name: "Updated Group",
          description: "Updated description",
          imageUrl: "https://example.com/updated-image.jpg",
        },
      });

      expect(result).toEqual(updatedGroup);
    });

    it("should update only name", async () => {
      const updateData = { name: "New Name Only" };

      const updatedGroup = { ...mockGroup, name: "New Name Only" };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      const result = await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          name: "New Name Only",
        },
      });

      expect(result).toEqual(updatedGroup);
    });

    it("should update only description", async () => {
      const updateData = { description: "New description only" };

      const updatedGroup = { ...mockGroup, description: "New description only" };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          description: "New description only",
        },
      });
    });

    it("should update only image URL", async () => {
      const updateData = { imageUrl: "https://example.com/new-only-image.jpg" };

      const updatedGroup = { ...mockGroup, imageUrl: "https://example.com/new-only-image.jpg" };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          imageUrl: "https://example.com/new-only-image.jpg",
        },
      });
    });

    it("should handle setting description to empty string", async () => {
      const updateData = { description: "" };

      const updatedGroup = { ...mockGroup, description: "" };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          description: "",
        },
      });
    });

    it("should handle setting description to undefined", async () => {
      const updateData = { description: undefined };

      const updatedGroup = { ...mockGroup, description: undefined };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
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

      const updatedGroup = { ...mockGroup, ...updateData };
      mockPrisma.productGroup.update.mockResolvedValue(updatedGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {
          name: "Name and Desc Update",
          description: "Updated description",
        },
      });
    });

    it("should handle empty update data", async () => {
      const updateData = {};

      mockPrisma.productGroup.update.mockResolvedValue(mockGroup);

      await productGroupService.updateProductGroup(mockGroupId, updateData);

      expect(mockPrisma.productGroup.update).toHaveBeenCalledWith({
        where: { id: mockGroupId },
        data: {},
      });
    });
  });

  describe("deleteProductGroup", () => {
    it("should delete a product group successfully", async () => {
      mockPrisma.productGroup.delete.mockResolvedValue(mockGroup);

      const result = await productGroupService.deleteProductGroup(mockGroupId);

      expect(mockPrisma.productGroup.delete).toHaveBeenCalledWith({
        where: { id: mockGroupId },
      });

      expect(result).toEqual(mockGroup);
    });

    it("should handle deletion of non-existent group", async () => {
      mockPrisma.productGroup.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(productGroupService.deleteProductGroup(mockGroupId)).rejects.toThrow(
        "Record to delete does not exist"
      );

      expect(mockPrisma.productGroup.delete).toHaveBeenCalledWith({
        where: { id: mockGroupId },
      });
    });

    it("should handle foreign key constraint errors", async () => {
      mockPrisma.productGroup.delete.mockRejectedValue(
        new Error("Foreign key constraint violation")
      );

      await expect(productGroupService.deleteProductGroup(mockGroupId)).rejects.toThrow(
        "Foreign key constraint violation"
      );
    });
  });
});
