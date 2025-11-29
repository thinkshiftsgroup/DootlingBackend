import {
  createProductVariant,
  getProductVariants,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
  exportProductVariantsCSV,
} from "../productVariant.controller";
import { productVariantService } from "../../services/productVariant.service";
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";

// Mock dependencies
jest.mock("../../services/productVariant.service");
jest.mock("json2csv");

const mockProductVariantService = productVariantService as jest.Mocked<typeof productVariantService>;
const MockParser = Parser as jest.MockedClass<typeof Parser>;

describe("Product Variant Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      header: jest.fn().mockReturnThis(),
      attachment: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  const mockStoreId = "1";
  const mockVariantId = "123";
  const mockVariant = {
    id: 123,
    name: "Test Variant",
    hasMultipleOptions: true,
    options: [
      { id: 1, name: "Color", variantId: 123, createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "Size", variantId: 123, createdAt: new Date(), updatedAt: new Date() },
    ],
    storeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createProductVariant", () => {
    it("should create a product variant successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Variant",
        hasMultipleOptions: true,
        options: ["Color", "Size"],
      };

      mockProductVariantService.createProductVariant.mockResolvedValue(mockVariant);

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.createProductVariant).toHaveBeenCalledWith(1, {
        name: "Test Variant",
        hasMultipleOptions: true,
        options: ["Color", "Size"],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVariant,
      });
    });

    it("should create a variant with default hasMultipleOptions", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Simple Variant",
        options: [],
      };

      const simpleVariant = { ...mockVariant, name: "Simple Variant", hasMultipleOptions: false };
      mockProductVariantService.createProductVariant.mockResolvedValue(simpleVariant);

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.createProductVariant).toHaveBeenCalledWith(1, {
        name: "Simple Variant",
        hasMultipleOptions: false,
        options: [],
      });
    });

    it("should create a variant with empty options", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "No Options Variant",
      };

      const noOptionsVariant = { ...mockVariant, name: "No Options Variant", options: [] };
      mockProductVariantService.createProductVariant.mockResolvedValue(noOptionsVariant);

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.createProductVariant).toHaveBeenCalledWith(1, {
        name: "No Options Variant",
        hasMultipleOptions: false,
        options: [],
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Variant" };

      mockProductVariantService.createProductVariant.mockRejectedValue(new Error("Service error"));

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Test Variant" };

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = { name: "Test Variant" };

      await createProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getProductVariants", () => {
    const mockVariantsResult = {
      variants: [mockVariant],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it("should get product variants with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductVariantService.getProductVariants.mockResolvedValue(mockVariantsResult);

      await getProductVariants(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariants).toHaveBeenCalledWith(1, {
        search: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVariantsResult,
      });
    });

    it("should get product variants with search and pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "Test",
        page: "2",
        limit: "5",
      };

      mockProductVariantService.getProductVariants.mockResolvedValue(mockVariantsResult);

      await getProductVariants(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariants).toHaveBeenCalledWith(1, {
        search: "Test",
        page: 2,
        limit: 5,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductVariantService.getProductVariants.mockRejectedValue(new Error("Service error"));

      await getProductVariants(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockProductVariantService.getProductVariants.mockResolvedValue(mockVariantsResult);

      await getProductVariants(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariants).toHaveBeenCalledWith(1, {
        search: undefined,
        page: NaN,
        limit: 10,
      });
    });

    it("should handle invalid limit number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        limit: "invalid",
      };

      mockProductVariantService.getProductVariants.mockResolvedValue(mockVariantsResult);

      await getProductVariants(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariants).toHaveBeenCalledWith(1, {
        search: undefined,
        page: 1,
        limit: NaN,
      });
    });
  });

  describe("getProductVariantById", () => {
    it("should get a product variant by ID successfully", async () => {
      mockRequest.params = { id: mockVariantId };

      mockProductVariantService.getProductVariantById.mockResolvedValue(mockVariant);

      await getProductVariantById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariantById).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockVariant,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockVariantId };

      mockProductVariantService.getProductVariantById.mockRejectedValue(new Error("Service error"));

      await getProductVariantById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing variant ID", async () => {
      mockRequest.params = {};

      await getProductVariantById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN variant ID", async () => {
      mockRequest.params = { id: "NaN" };

      await getProductVariantById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle zero variant ID", async () => {
      mockRequest.params = { id: "0" };

      mockProductVariantService.getProductVariantById.mockResolvedValue(mockVariant);

      await getProductVariantById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getProductVariantById).toHaveBeenCalledWith(0);
    });
  });

  describe("updateProductVariant", () => {
    it("should update a product variant successfully", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = {
        name: "Updated Variant",
        hasMultipleOptions: false,
        options: ["Material"],
      };

      const updatedVariant = { ...mockVariant, name: "Updated Variant", hasMultipleOptions: false, options: [] };
      mockProductVariantService.updateProductVariant.mockResolvedValue(updatedVariant);

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.updateProductVariant).toHaveBeenCalledWith(123, {
        name: "Updated Variant",
        hasMultipleOptions: false,
        options: ["Material"],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedVariant,
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = {
        name: "New Name Only",
      };

      const nameUpdatedVariant = { ...mockVariant, name: "New Name Only" };
      mockProductVariantService.updateProductVariant.mockResolvedValue(nameUpdatedVariant);

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.updateProductVariant).toHaveBeenCalledWith(123, {
        name: "New Name Only",
        hasMultipleOptions: undefined,
        options: undefined,
      });
    });

    it("should update only hasMultipleOptions", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = {
        hasMultipleOptions: false,
      };

      const optionsUpdatedVariant = { ...mockVariant, hasMultipleOptions: false };
      mockProductVariantService.updateProductVariant.mockResolvedValue(optionsUpdatedVariant);

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.updateProductVariant).toHaveBeenCalledWith(123, {
        name: undefined,
        hasMultipleOptions: false,
        options: undefined,
      });
    });

    it("should update only options", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = {
        options: ["Material"],
      };

      const optionsUpdatedVariant = { ...mockVariant, options: [{ id: 3, name: "Material", variantId: 123, createdAt: new Date(), updatedAt: new Date() }] };
      mockProductVariantService.updateProductVariant.mockResolvedValue(optionsUpdatedVariant);

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.updateProductVariant).toHaveBeenCalledWith(123, {
        name: undefined,
        hasMultipleOptions: undefined,
        options: ["Material"],
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = { name: "Updated Variant" };

      mockProductVariantService.updateProductVariant.mockRejectedValue(new Error("Service error"));

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty update body", async () => {
      mockRequest.params = { id: mockVariantId };
      mockRequest.body = {};

      mockProductVariantService.updateProductVariant.mockResolvedValue(mockVariant);

      await updateProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.updateProductVariant).toHaveBeenCalledWith(123, {
        name: undefined,
        hasMultipleOptions: undefined,
        options: undefined,
      });
    });
  });

  describe("deleteProductVariant", () => {
    it("should delete a product variant successfully", async () => {
      mockRequest.params = { id: mockVariantId };

      mockProductVariantService.deleteProductVariant.mockResolvedValue(mockVariant);

      await deleteProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.deleteProductVariant).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Product variant deleted successfully",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockVariantId };

      mockProductVariantService.deleteProductVariant.mockRejectedValue(new Error("Service error"));

      await deleteProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing variant ID", async () => {
      mockRequest.params = {};

      await deleteProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN variant ID", async () => {
      mockRequest.params = { id: "NaN" };

      await deleteProductVariant(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("exportProductVariantsCSV", () => {
    const mockAllVariants = [
      mockVariant,
      { 
        ...mockVariant, 
        id: 124, 
        name: "Variant 2", 
        options: [{ id: 3, name: "Size", variantId: 124, createdAt: new Date(), updatedAt: new Date() }] 
      },
    ];

    it("should export product variants to CSV successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockProductVariantService.getAllProductVariants.mockResolvedValue(mockAllVariants);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductVariantsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductVariantService.getAllProductVariants).toHaveBeenCalledWith(1);
      expect(MockParser).toHaveBeenCalledWith({
        fields: ["id", "name", "hasMultipleOptions", "options", "createdAt"],
      });
      expect(mockParserInstance.parse).toHaveBeenCalledWith([
        {
          id: 123,
          name: "Test Variant",
          hasMultipleOptions: true,
          options: "Color, Size",
          createdAt: mockVariant.createdAt,
        },
        {
          id: 124,
          name: "Variant 2",
          hasMultipleOptions: true,
          options: "Size",
          createdAt: mockAllVariants[1].createdAt,
        },
      ]);
      expect(mockResponse.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(mockResponse.attachment).toHaveBeenCalledWith("product-variants.csv");
      expect(mockResponse.send).toHaveBeenCalledWith("csv,data");
    });

    it("should export variants with no options", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const variantWithNoOptions = { ...mockVariant, options: [] };
      mockProductVariantService.getAllProductVariants.mockResolvedValue([variantWithNoOptions]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductVariantsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([
        {
          id: 123,
          name: "Test Variant",
          hasMultipleOptions: true,
          options: "",
          createdAt: variantWithNoOptions.createdAt,
        },
      ]);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockProductVariantService.getAllProductVariants.mockRejectedValue(new Error("Service error"));

      await exportProductVariantsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty variants list", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockProductVariantService.getAllProductVariants.mockResolvedValue([]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue(""),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductVariantsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([]);
      expect(mockResponse.send).toHaveBeenCalledWith("");
    });

    it("should handle CSV parsing errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockProductVariantService.getAllProductVariants.mockResolvedValue(mockAllVariants);
      
      const mockParserInstance = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error("CSV parsing error");
        }),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductVariantsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
