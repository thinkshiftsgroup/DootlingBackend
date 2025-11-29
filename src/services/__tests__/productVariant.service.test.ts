import { productVariantService } from "../productVariant.service";
import { prisma } from "../../prisma";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  productVariant: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  productVariantOption: {
    deleteMany: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("ProductVariant Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockVariantId = 1;

  const mockVariant = {
    id: mockVariantId,
    storeId: mockStoreId,
    name: "Test Variant",
    hasMultipleOptions: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    options: [
      {
        id: 1,
        variantId: mockVariantId,
        name: "Red",
      },
      {
        id: 2,
        variantId: mockVariantId,
        name: "Large",
      },
    ],
  };

  describe("createProductVariant", () => {
    it("should create a product variant with multiple options", async () => {
      const createData = {
        name: "Test Variant",
        hasMultipleOptions: true,
        options: ["Red", "Blue", "Green"],
      };

      mockPrisma.productVariant.create.mockResolvedValue(mockVariant);

      const result = await productVariantService.createProductVariant(mockStoreId, createData);

      expect(mockPrisma.productVariant.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Test Variant",
          hasMultipleOptions: true,
          options: {
            create: [
              { name: "Red" },
              { name: "Blue" },
              { name: "Green" },
            ],
          },
        },
        include: { options: true },
      });

      expect(result).toEqual(mockVariant);
    });

    it("should create a product variant with single option", async () => {
      const createData = {
        name: "Single Option Variant",
        hasMultipleOptions: false,
        options: ["Standard"],
      };

      const singleOptionVariant = {
        ...mockVariant,
        name: "Single Option Variant",
        hasMultipleOptions: false,
        options: [{ id: 1, variantId: mockVariantId, name: "Standard" }],
      };
      mockPrisma.productVariant.create.mockResolvedValue(singleOptionVariant);

      const result = await productVariantService.createProductVariant(mockStoreId, createData);

      expect(mockPrisma.productVariant.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Single Option Variant",
          hasMultipleOptions: false,
          options: {
            create: [{ name: "Standard" }],
          },
        },
        include: { options: true },
      });

      expect(result).toEqual(singleOptionVariant);
    });

    it("should create a product variant with no options", async () => {
      const createData = {
        name: "No Options Variant",
        hasMultipleOptions: false,
        options: [],
      };

      const noOptionsVariant = {
        ...mockVariant,
        name: "No Options Variant",
        hasMultipleOptions: false,
        options: [],
      };
      mockPrisma.productVariant.create.mockResolvedValue(noOptionsVariant);

      const result = await productVariantService.createProductVariant(mockStoreId, createData);

      expect(mockPrisma.productVariant.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "No Options Variant",
          hasMultipleOptions: false,
          options: {
            create: [],
          },
        },
        include: { options: true },
      });

      expect(result).toEqual(noOptionsVariant);
    });

    it("should create a product variant with many options", async () => {
      const createData = {
        name: "Many Options Variant",
        hasMultipleOptions: true,
        options: ["Option1", "Option2", "Option3", "Option4", "Option5"],
      };

      const manyOptionsVariant = {
        ...mockVariant,
        name: "Many Options Variant",
        options: createData.options.map((name, index) => ({
          id: index + 1,
          variantId: mockVariantId,
          name,
        })),
      };
      mockPrisma.productVariant.create.mockResolvedValue(manyOptionsVariant);

      await productVariantService.createProductVariant(mockStoreId, createData);

      expect(mockPrisma.productVariant.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Many Options Variant",
          hasMultipleOptions: true,
          options: {
            create: [
              { name: "Option1" },
              { name: "Option2" },
              { name: "Option3" },
              { name: "Option4" },
              { name: "Option5" },
            ],
          },
        },
        include: { options: true },
      });
    });
  });

  describe("getProductVariants", () => {
    const mockVariants = [mockVariant, { ...mockVariant, id: 2, name: "Variant 2" }];

    it("should get product variants with default pagination", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue(mockVariants);
      mockPrisma.productVariant.count.mockResolvedValue(2);

      const result = await productVariantService.getProductVariants(mockStoreId, {});

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 0,
        take: 10,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(mockPrisma.productVariant.count).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
      });

      expect(result).toEqual({
        variants: mockVariants,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should get product variants with custom pagination", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue(mockVariants);
      mockPrisma.productVariant.count.mockResolvedValue(25);

      const result = await productVariantService.getProductVariants(mockStoreId, {
        page: 2,
        limit: 5,
      });

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 5,
        take: 5,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(result.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 5,
        totalPages: 5,
      });
    });

    it("should search product variants by name", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      mockPrisma.productVariant.count.mockResolvedValue(1);

      const result = await productVariantService.getProductVariants(mockStoreId, {
        search: "Test",
      });

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "Test", mode: "insensitive" },
        },
        skip: 0,
        take: 10,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(result.variants).toHaveLength(1);
    });

    it("should handle search with pagination", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue([]);
      mockPrisma.productVariant.count.mockResolvedValue(0);

      await productVariantService.getProductVariants(mockStoreId, {
        search: "nonexistent",
        page: 3,
        limit: 20,
      });

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "nonexistent", mode: "insensitive" },
        },
        skip: 40,
        take: 20,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle empty search results", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue([]);
      mockPrisma.productVariant.count.mockResolvedValue(0);

      const result = await productVariantService.getProductVariants(mockStoreId, {
        search: "nonexistent",
      });

      expect(result.variants).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("should handle case-insensitive search", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue([mockVariant]);
      mockPrisma.productVariant.count.mockResolvedValue(1);

      await productVariantService.getProductVariants(mockStoreId, {
        search: "TEST VARIANT",
      });

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "TEST VARIANT", mode: "insensitive" },
        },
        skip: 0,
        take: 10,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });
    });

    it("should include options in results", async () => {
      const variantsWithOptions = [
        {
          ...mockVariant,
          options: [
            { id: 1, variantId: 1, name: "Red" },
            { id: 2, variantId: 1, name: "Large" },
          ],
        },
      ];
      mockPrisma.productVariant.findMany.mockResolvedValue(variantsWithOptions);
      mockPrisma.productVariant.count.mockResolvedValue(1);

      const result = await productVariantService.getProductVariants(mockStoreId, {});

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 0,
        take: 10,
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(result.variants[0].options).toHaveLength(2);
    });
  });

  describe("getAllProductVariants", () => {
    it("should get all product variants for a store", async () => {
      const allVariants = [mockVariant, { ...mockVariant, id: 2 }, { ...mockVariant, id: 3 }];
      mockPrisma.productVariant.findMany.mockResolvedValue(allVariants);

      const result = await productVariantService.getAllProductVariants(mockStoreId);

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toEqual(allVariants);
    });

    it("should handle empty variants list", async () => {
      mockPrisma.productVariant.findMany.mockResolvedValue([]);

      const result = await productVariantService.getAllProductVariants(mockStoreId);

      expect(result).toEqual([]);
    });

    it("should return variants ordered by creation date", async () => {
      const variants = [
        { ...mockVariant, id: 3, createdAt: new Date("2023-01-01") },
        { ...mockVariant, id: 2, createdAt: new Date("2023-02-01") },
        { ...mockVariant, id: 1, createdAt: new Date("2023-03-01") },
      ];
      mockPrisma.productVariant.findMany.mockResolvedValue(variants);

      const result = await productVariantService.getAllProductVariants(mockStoreId);

      expect(result).toEqual(variants);
    });

    it("should include options in all variants", async () => {
      const variantsWithOptions = [
        {
          ...mockVariant,
          options: [{ id: 1, variantId: 1, name: "Red" }],
        },
        {
          ...mockVariant,
          id: 2,
          options: [{ id: 3, variantId: 2, name: "Blue" }],
        },
      ];
      mockPrisma.productVariant.findMany.mockResolvedValue(variantsWithOptions);

      const result = await productVariantService.getAllProductVariants(mockStoreId);

      expect(mockPrisma.productVariant.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        include: { options: true },
        orderBy: { createdAt: "desc" },
      });

      expect(result[0].options).toHaveLength(1);
      expect(result[1].options).toHaveLength(1);
    });
  });

  describe("getProductVariantById", () => {
    it("should get a product variant by id successfully", async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(mockVariant);

      const result = await productVariantService.getProductVariantById(mockVariantId);

      expect(mockPrisma.productVariant.findUnique).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        include: { options: true },
      });

      expect(result).toEqual(mockVariant);
    });

    it("should throw error when product variant not found", async () => {
      mockPrisma.productVariant.findUnique.mockResolvedValue(null);

      await expect(productVariantService.getProductVariantById(mockVariantId)).rejects.toThrow(
        "Product variant not found"
      );

      expect(mockPrisma.productVariant.findUnique).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        include: { options: true },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.productVariant.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(productVariantService.getProductVariantById(mockVariantId)).rejects.toThrow(
        "Database connection failed"
      );
    });

    it("should include options when getting variant by id", async () => {
      const variantWithOptions = {
        ...mockVariant,
        options: [
          { id: 1, variantId: mockVariantId, name: "Red" },
          { id: 2, variantId: mockVariantId, name: "Large" },
        ],
      };
      mockPrisma.productVariant.findUnique.mockResolvedValue(variantWithOptions);

      const result = await productVariantService.getProductVariantById(mockVariantId);

      expect(mockPrisma.productVariant.findUnique).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        include: { options: true },
      });

      expect(result.options).toHaveLength(2);
    });
  });

  describe("updateProductVariant", () => {
    it("should update all fields of a product variant", async () => {
      const updateData = {
        name: "Updated Variant",
        hasMultipleOptions: false,
        options: ["New Option 1", "New Option 2"],
      };

      const updatedVariant = {
        ...mockVariant,
        name: "Updated Variant",
        hasMultipleOptions: false,
        options: [
          { id: 3, variantId: mockVariantId, name: "New Option 1" },
          { id: 4, variantId: mockVariantId, name: "New Option 2" },
        ],
      };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      const result = await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
      });

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          name: "Updated Variant",
          hasMultipleOptions: false,
          options: {
            create: [
              { name: "New Option 1" },
              { name: "New Option 2" },
            ],
          },
        },
        include: { options: true },
      });

      expect(result).toEqual(updatedVariant);
    });

    it("should update only name", async () => {
      const updateData = { name: "New Name Only" };

      const updatedVariant = { ...mockVariant, name: "New Name Only" };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      const result = await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).not.toHaveBeenCalled();

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          name: "New Name Only",
        },
        include: { options: true },
      });

      expect(result).toEqual(updatedVariant);
    });

    it("should update only hasMultipleOptions", async () => {
      const updateData = { hasMultipleOptions: false };

      const updatedVariant = { ...mockVariant, hasMultipleOptions: false };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).not.toHaveBeenCalled();

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          hasMultipleOptions: false,
        },
        include: { options: true },
      });
    });

    it("should update only options", async () => {
      const updateData = {
        options: ["Option A", "Option B", "Option C"],
      };

      const updatedVariant = {
        ...mockVariant,
        options: [
          { id: 5, variantId: mockVariantId, name: "Option A" },
          { id: 6, variantId: mockVariantId, name: "Option B" },
          { id: 7, variantId: mockVariantId, name: "Option C" },
        ],
      };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      const result = await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
      });

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          options: {
            create: [
              { name: "Option A" },
              { name: "Option B" },
              { name: "Option C" },
            ],
          },
        },
        include: { options: true },
      });

      expect(result).toEqual(updatedVariant);
    });

    it("should handle updating options to empty array", async () => {
      const updateData = {
        options: [],
      };

      const updatedVariant = { ...mockVariant, options: [] };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      const result = await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
      });

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          options: {
            create: [],
          },
        },
        include: { options: true },
      });

      expect(result.options).toEqual([]);
    });

    it("should handle updating name and hasMultipleOptions together", async () => {
      const updateData = {
        name: "Combined Update",
        hasMultipleOptions: true,
      };

      const updatedVariant = {
        ...mockVariant,
        name: "Combined Update",
        hasMultipleOptions: true,
      };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).not.toHaveBeenCalled();

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          name: "Combined Update",
          hasMultipleOptions: true,
        },
        include: { options: true },
      });
    });

    it("should handle setting hasMultipleOptions to false", async () => {
      const updateData = {
        hasMultipleOptions: false,
      };

      const updatedVariant = { ...mockVariant, hasMultipleOptions: false };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          hasMultipleOptions: false,
        },
        include: { options: true },
      });
    });

    it("should handle empty update data", async () => {
      const updateData = {};

      mockPrisma.productVariant.update.mockResolvedValue(mockVariant);

      const result = await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).not.toHaveBeenCalled();

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {},
        include: { options: true },
      });

      expect(result).toEqual(mockVariant);
    });

    it("should handle updating with single option", async () => {
      const updateData = {
        options: ["Single Option"],
      };

      const updatedVariant = {
        ...mockVariant,
        options: [{ id: 8, variantId: mockVariantId, name: "Single Option" }],
      };
      mockPrisma.productVariant.update.mockResolvedValue(updatedVariant);

      await productVariantService.updateProductVariant(mockVariantId, updateData);

      expect(mockPrisma.productVariantOption.deleteMany).toHaveBeenCalledWith({
        where: { variantId: mockVariantId },
      });

      expect(mockPrisma.productVariant.update).toHaveBeenCalledWith({
        where: { id: mockVariantId },
        data: {
          options: {
            create: [{ name: "Single Option" }],
          },
        },
        include: { options: true },
      });
    });
  });

  describe("deleteProductVariant", () => {
    it("should delete a product variant successfully", async () => {
      mockPrisma.productVariant.delete.mockResolvedValue(mockVariant);

      const result = await productVariantService.deleteProductVariant(mockVariantId);

      expect(mockPrisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: mockVariantId },
      });

      expect(result).toEqual(mockVariant);
    });

    it("should handle deletion of non-existent variant", async () => {
      mockPrisma.productVariant.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(productVariantService.deleteProductVariant(mockVariantId)).rejects.toThrow(
        "Record to delete does not exist"
      );

      expect(mockPrisma.productVariant.delete).toHaveBeenCalledWith({
        where: { id: mockVariantId },
      });
    });

    it("should handle foreign key constraint errors", async () => {
      mockPrisma.productVariant.delete.mockRejectedValue(
        new Error("Foreign key constraint violation")
      );

      await expect(productVariantService.deleteProductVariant(mockVariantId)).rejects.toThrow(
        "Foreign key constraint violation"
      );
    });

    it("should handle database connection errors", async () => {
      mockPrisma.productVariant.delete.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(productVariantService.deleteProductVariant(mockVariantId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });
});
