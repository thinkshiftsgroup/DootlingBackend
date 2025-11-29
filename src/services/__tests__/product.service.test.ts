import {
  createProduct,
  updateProduct,
  listProducts,
  deleteProduct,
} from "../product.service";
import { prisma } from "../../prisma";
import { ProductCreationData, ProductUpdateData } from "../../types";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  product: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  productPricing: {
    deleteMany: jest.fn(),
  },
  productDescriptionDetail: {
    deleteMany: jest.fn(),
  },
  productOption: {
    deleteMany: jest.fn(),
  },
  productCategory: {
    deleteMany: jest.fn(),
  },
  productUpsell: {
    deleteMany: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("Product Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockProductId = 1;

  const mockProductData: ProductCreationData = {
    name: "Test Product",
    productImages: ["image1.jpg", "image2.jpg"],
    shortDescription: "A test product",
    stockQuantity: 100,
    type: "REGULAR",
    pricings: [
      {
        currencyCode: "USD",
        sellingPrice: 29.99,
        originalPrice: 39.99,
      },
    ],
    descriptionDetails: [
      {
        title: "Features",
        description: "Great features",
      },
    ],
    options: [
      {
        optionType: "Size",
        values: ["S", "M", "L"],
      },
    ],
    categories: [1, 2],
    upsellProductIds: [3],
    crossSellProductIds: [4],
  };

  const mockProduct = {
    id: mockProductId,
    name: "Test Product",
    storeId: mockStoreId,
    pricings: [
      {
        id: 1,
        currencyCode: "USD",
        sellingPrice: 29.99,
        originalPrice: 39.99,
      },
    ],
    descriptionDetails: [
      {
        id: 1,
        title: "Features",
        description: "Great features",
      },
    ],
    options: [
      {
        id: 1,
        optionType: "Size",
        values: ["S", "M", "L"],
      },
    ],
    categories: [
      {
        id: 1,
        categoryId: 1,
        category: { id: 1, name: "Category 1" },
      },
    ],
  };

  describe("createProduct", () => {
    it("should create a product successfully with all data", async () => {
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await createProduct(mockStoreId, mockProductData);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Test Product",
          productImages: ["image1.jpg", "image2.jpg"],
          shortDescription: "A test product",
          stockQuantity: 100,
          type: "REGULAR",
          storeId: mockStoreId,
          pricings: {
            create: [
              {
                currencyCode: "USD",
                sellingPrice: 29.99,
                originalPrice: 39.99,
              },
            ],
          },
          descriptionDetails: {
            create: [
              {
                title: "Features",
                description: "Great features",
              },
            ],
          },
          options: {
            create: [
              {
                optionType: "Size",
                values: ["S", "M", "L"],
              },
            ],
          },
          categories: {
            create: [{ categoryId: 1 }, { categoryId: 2 }],
          },
          upsellProducts: {
            create: [
              {
                upsellProduct: {
                  connect: { id: 3 },
                },
              },
            ],
          },
          crossSellProducts: {
            create: [
              {
                product: {
                  connect: { id: 4 },
                },
              },
            ],
          },
        }),
        include: {
          pricings: true,
          descriptionDetails: true,
          options: true,
          categories: {
            include: { category: true },
          },
        },
      });

      expect(result).toEqual(mockProduct);
    });

    it("should create a product with minimal required data", async () => {
      const minimalData: ProductCreationData = {
        name: "Minimal Product",
        productImages: [],
        shortDescription: "Minimal description",
        stockQuantity: 50,
        type: "REGULAR",
        pricings: [{ currencyCode: "USD", sellingPrice: 10.0 }],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      };

      const minimalProduct = { ...mockProduct, name: "Minimal Product" };
      mockPrisma.product.create.mockResolvedValue(minimalProduct);

      await createProduct(mockStoreId, minimalData);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          name: "Minimal Product",
          productImages: [],
          shortDescription: "Minimal description",
          stockQuantity: 50,
          type: "REGULAR",
          storeId: mockStoreId,
          pricings: {
            create: [{ currencyCode: "USD", sellingPrice: 10.0, originalPrice: null }],
          },
          descriptionDetails: {
            create: [],
          },
          options: {
            create: [],
          },
          categories: {
            create: [],
          },
          upsellProducts: {
            create: [],
          },
          crossSellProducts: {
            create: [],
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
    });

    it("should handle pricings without original price", async () => {
      const dataWithoutOriginalPrice = {
        ...mockProductData,
        pricings: [{ currencyCode: "USD", sellingPrice: 19.99 }],
      };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await createProduct(mockStoreId, dataWithoutOriginalPrice);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pricings: {
            create: [
              {
                currencyCode: "USD",
                sellingPrice: 19.99,
                originalPrice: null,
              },
            ],
          },
        }),
        include: expect.any(Object),
      });
    });

    it("should handle empty upsell and cross sell arrays", async () => {
      const dataWithoutUpsellCrossSell = {
        ...mockProductData,
        upsellProductIds: [],
        crossSellProductIds: [],
      };

      mockPrisma.product.create.mockResolvedValue(mockProduct);

      await createProduct(mockStoreId, dataWithoutUpsellCrossSell);

      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          upsellProducts: {
            create: [],
          },
          crossSellProducts: {
            create: [],
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe("updateProduct", () => {
    const mockUpdateData: ProductUpdateData = {
      name: "Updated Product",
      stockQuantity: 150,
      pricings: [{ currencyCode: "EUR", sellingPrice: 35.99 }],
      descriptionDetails: [{ title: "Updated", description: "Updated description" }],
      options: [{ optionType: "Color", values: ["Red", "Blue"] }],
      categories: [3],
      upsellProductIds: [5],
      crossSellProductIds: [6],
    };

    it("should update a product successfully with all fields", async () => {
      const updatedProduct = { ...mockProduct, name: "Updated Product" };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      const result = await updateProduct(mockProductId, mockUpdateData);

      expect(mockPrisma.productPricing.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });
      expect(mockPrisma.productDescriptionDetail.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });
      expect(mockPrisma.productOption.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });
      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });
      expect(mockPrisma.productUpsell.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: expect.objectContaining({
          name: "Updated Product",
          stockQuantity: 150,
          pricings: {
            create: [{ currencyCode: "EUR", sellingPrice: 35.99, originalPrice: null }],
          },
          descriptionDetails: {
            create: [{ title: "Updated", description: "Updated description" }],
          },
          options: {
            create: [{ optionType: "Color", values: ["Red", "Blue"] }],
          },
          categories: {
            create: [{ categoryId: 3 }],
          },
          upsellProducts: {
            create: [
              { upsellProductId: 5 },
              { upsellProductId: 6 },
            ],
          },
        }),
        include: {
          pricings: true,
          descriptionDetails: true,
          options: true,
          categories: {
            include: { category: true },
          },
        },
      });

      expect(result).toEqual(updatedProduct);
    });

    it("should update only basic fields without relations", async () => {
      const basicUpdate: ProductUpdateData = {
        name: "Basic Update",
        shortDescription: "Updated description",
      };

      const updatedProduct = { ...mockProduct, name: "Basic Update" };
      mockPrisma.product.update.mockResolvedValue(updatedProduct);

      await updateProduct(mockProductId, basicUpdate);

      expect(mockPrisma.productPricing.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.productDescriptionDetail.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.productOption.deleteMany).not.toHaveBeenCalled();
      expect(mockPrisma.productCategory.deleteMany).not.toHaveBeenCalled();
      // Note: upsellProductIds and crossSellProductIds default to [], so the condition
      // (upsellProductIds || crossSellProductIds) will be true, but create arrays will be empty

      expect(mockPrisma.productUpsell.deleteMany).toHaveBeenCalled();

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          name: "Basic Update",
          shortDescription: "Updated description",
          upsellProducts: {
            create: [],
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
    });

    it("should handle only upsell products update", async () => {
      const upsellUpdate: ProductUpdateData = {
        upsellProductIds: [7, 8],
      };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      await updateProduct(mockProductId, upsellUpdate);

      expect(mockPrisma.productUpsell.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          upsellProducts: {
            create: [{ upsellProductId: 7 }, { upsellProductId: 8 }],
          },
        },
        include: expect.any(Object),
      });
    });

    it("should handle only cross sell products update", async () => {
      const crossSellUpdate: ProductUpdateData = {
        crossSellProductIds: [9, 10],
      };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      await updateProduct(mockProductId, crossSellUpdate);

      expect(mockPrisma.productUpsell.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          upsellProducts: {
            create: [{ upsellProductId: 9 }, { upsellProductId: 10 }],
          },
        },
        include: expect.any(Object),
      });
    });

    it("should handle empty arrays in update", async () => {
      const emptyArraysUpdate: ProductUpdateData = {
        pricings: [],
        descriptionDetails: [],
        options: [],
        categories: [],
        upsellProductIds: [],
        crossSellProductIds: [],
      };

      mockPrisma.product.update.mockResolvedValue(mockProduct);

      await updateProduct(mockProductId, emptyArraysUpdate);

      expect(mockPrisma.product.update).toHaveBeenCalledWith({
        where: { id: mockProductId },
        data: {
          pricings: { create: [] },
          descriptionDetails: { create: [] },
          options: { create: [] },
          categories: { create: [] },
          upsellProducts: { create: [] },
        },
        include: expect.any(Object),
      });
    });
  });

  describe("listProducts", () => {
    const mockProducts = [mockProduct, { ...mockProduct, id: 2 }];

    it("should list products with default pagination", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      const result = await listProducts(mockStoreId);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        take: 10,
        skip: 0,
        orderBy: [{ createdAt: "desc" }],
        include: {
          pricings: true,
          categories: {
            include: { category: true },
          },
          options: true,
        },
      });

      expect(mockPrisma.product.count).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
      });

      expect(result).toEqual({
        products: mockProducts,
        meta: {
          totalCount: 2,
          page: 1,
          pageSize: 10,
          totalPages: 1,
        },
      });
    });

    it("should list products with custom pagination", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(25);

      const result = await listProducts(mockStoreId, 2, 5);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        take: 5,
        skip: 5,
        orderBy: [{ createdAt: "desc" }],
        include: expect.any(Object),
      });

      expect(result.meta).toEqual({
        totalCount: 25,
        page: 2,
        pageSize: 5,
        totalPages: 5,
      });
    });

    it("should filter products by name", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      await listProducts(mockStoreId, 1, 10, { productName: "Test" });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: {
            contains: "Test",
            mode: "insensitive",
          },
        },
        take: 10,
        skip: 0,
        orderBy: [{ createdAt: "desc" }],
        include: expect.any(Object),
      });
    });

    it("should filter products by category", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      await listProducts(mockStoreId, 1, 10, { categoryId: 1 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          categories: {
            some: {
              categoryId: 1,
            },
          },
        },
        take: 10,
        skip: 0,
        orderBy: [{ createdAt: "desc" }],
        include: expect.any(Object),
      });
    });

    it("should sort products by price highest first", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      await listProducts(mockStoreId, 1, 10, { sortByPrice: "highest" });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        take: 10,
        skip: 0,
        orderBy: [
          {
            pricings: {
              sellingPrice: "desc",
            },
          },
          { id: "desc" },
        ],
        include: expect.any(Object),
      });
    });

    it("should sort products by price lowest first", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(2);

      await listProducts(mockStoreId, 1, 10, { sortByPrice: "lowest" });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        take: 10,
        skip: 0,
        orderBy: [
          {
            pricings: {
              sellingPrice: "asc",
            },
          },
          { id: "asc" },
        ],
        include: expect.any(Object),
      });
    });

    it("should handle multiple filters together", async () => {
      mockPrisma.product.findMany.mockResolvedValue(mockProducts);
      mockPrisma.product.count.mockResolvedValue(1);

      await listProducts(mockStoreId, 1, 10, {
        productName: "Test",
        categoryId: 1,
        sortByPrice: "highest",
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: {
            contains: "Test",
            mode: "insensitive",
          },
          categories: {
            some: {
              categoryId: 1,
            },
          },
        },
        take: 10,
        skip: 0,
        orderBy: [
          {
            pricings: {
              sellingPrice: "desc",
            },
          },
          { id: "desc" },
        ],
        include: expect.any(Object),
      });
    });

    it("should handle empty results", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);
      mockPrisma.product.count.mockResolvedValue(0);

      const result = await listProducts(mockStoreId);

      expect(result.products).toEqual([]);
      expect(result.meta.totalCount).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });

  describe("deleteProduct", () => {
    it("should delete a product successfully", async () => {
      mockPrisma.productCategory.deleteMany.mockResolvedValue({});
      mockPrisma.productUpsell.deleteMany.mockResolvedValue({});
      mockPrisma.product.delete.mockResolvedValue({});

      await deleteProduct(mockProductId);

      expect(mockPrisma.productCategory.deleteMany).toHaveBeenCalledWith({
        where: { productId: mockProductId },
      });

      expect(mockPrisma.productUpsell.deleteMany).toHaveBeenCalledWith({
        where: {
          OR: [{ productId: mockProductId }, { upsellProductId: mockProductId }],
        },
      });

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({
        where: { id: mockProductId },
      });
    });

    it("should handle deletion errors gracefully", async () => {
      mockPrisma.productCategory.deleteMany.mockRejectedValue(
        new Error("Database error")
      );

      await expect(deleteProduct(mockProductId)).rejects.toThrow("Database error");
    });
  });
});
