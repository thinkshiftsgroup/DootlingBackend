import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  exportBrandsCSV,
} from "../brand.controller";
import { brandService } from "../../services/brand.service";
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";

// Mock dependencies
jest.mock("../../services/brand.service");
jest.mock("json2csv");

const mockBrandService = brandService as jest.Mocked<typeof brandService>;
const MockParser = Parser as jest.MockedClass<typeof Parser>;

// Mock cloudinary module
jest.mock("../../utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn(),
}));

describe("Brand Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockUploadToCloudinary: jest.Mock;

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
    mockUploadToCloudinary = require("../../utils/cloudinary").uploadToCloudinary;
  });

  const mockStoreId = "1";
  const mockBrandId = "123";
  const mockBrand = {
    id: 123,
    name: "Test Brand",
    description: "A test brand",
    imageUrl: "https://example.com/image.jpg",
    storeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFile = {
    buffer: Buffer.from("test image data"),
    mimetype: "image/jpeg",
    originalname: "test.jpg",
  } as Express.Multer.File;

  describe("createBrand", () => {
    it("should create a brand successfully without file", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Brand",
        description: "A test brand",
      };
      mockRequest.file = undefined;

      mockBrandService.createBrand.mockResolvedValue(mockBrand);

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: "Test Brand",
        description: "A test brand",
        imageUrl: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrand,
      });
    });

    it("should create a brand successfully with file", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Brand with Image",
        description: "A test brand with image",
      };
      mockRequest.file = mockFile;

      const uploadedUrl = "https://cloudinary.com/uploaded-image.jpg";
      mockUploadToCloudinary.mockResolvedValue(uploadedUrl);
      mockBrandService.createBrand.mockResolvedValue(mockBrand);

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "image");
      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: "Test Brand with Image",
        description: "A test brand with image",
        imageUrl: uploadedUrl,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrand,
      });
    });

    it("should create a brand with only name", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Minimal Brand",
      };
      mockRequest.file = undefined;

      const minimalBrand = { ...mockBrand, name: "Minimal Brand", description: null };
      mockBrandService.createBrand.mockResolvedValue(minimalBrand);

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: "Minimal Brand",
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should create a brand with only description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        description: "Only description brand",
      };
      mockRequest.file = undefined;

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: undefined,
        description: "Only description brand",
        imageUrl: undefined,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.body = { name: "Test Brand" };
      mockRequest.file = undefined;

      mockBrandService.createBrand.mockRejectedValue(new Error("Invalid store ID"));

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Brand" };
      mockRequest.file = undefined;

      mockBrandService.createBrand.mockRejectedValue(new Error("Service error"));

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle file upload errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Brand" };
      mockRequest.file = mockFile;

      mockUploadToCloudinary.mockRejectedValue(new Error("Upload failed"));

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Test Brand" };
      mockRequest.file = undefined;

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = { name: "Test Brand" };
      mockRequest.file = undefined;

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty body", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {};
      mockRequest.file = undefined;

      mockBrandService.createBrand.mockResolvedValue(mockBrand);

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: undefined,
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should handle empty description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Brand with empty desc",
        description: "",
      };
      mockRequest.file = undefined;

      await createBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.createBrand).toHaveBeenCalledWith(1, {
        name: "Brand with empty desc",
        description: "",
        imageUrl: undefined,
      });
    });
  });

  describe("getBrands", () => {
    const mockBrandsResult = {
      brands: [mockBrand],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it("should get brands with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
        search: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrandsResult,
      });
    });

    it("should get brands with search and pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "Test",
        page: "2",
        limit: "5",
      };

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
        search: "Test",
        page: 2,
        limit: 5,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.query = {};

      mockBrandService.getBrands.mockRejectedValue(new Error("Invalid store ID"));

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockBrandService.getBrands.mockRejectedValue(new Error("Service error"));

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
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

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
        search: undefined,
        page: 1,
        limit: NaN,
      });
    });

    it("should handle empty search", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "",
      };

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
        search: "",
        page: 1,
        limit: 10,
      });
    });

    it("should handle case-insensitive search", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "TEST BRAND",
      };

      mockBrandService.getBrands.mockResolvedValue(mockBrandsResult);

      await getBrands(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrands).toHaveBeenCalledWith(1, {
        search: "TEST BRAND",
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getBrandById", () => {
    it("should get a brand by ID successfully", async () => {
      mockRequest.params = { id: mockBrandId };

      mockBrandService.getBrandById.mockResolvedValue(mockBrand);

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrandById).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBrand,
      });
    });

    it("should handle invalid brand ID", async () => {
      mockRequest.params = { id: "invalid" };

      mockBrandService.getBrandById.mockRejectedValue(new Error("Invalid brand ID"));

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockBrandId };

      mockBrandService.getBrandById.mockRejectedValue(new Error("Service error"));

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing brand ID", async () => {
      mockRequest.params = {};

      mockBrandService.getBrandById.mockRejectedValue(new Error("Missing brand ID"));

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN brand ID", async () => {
      mockRequest.params = { id: "NaN" };

      mockBrandService.getBrandById.mockRejectedValue(new Error("Invalid brand ID"));

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle zero brand ID", async () => {
      mockRequest.params = { id: "0" };

      mockBrandService.getBrandById.mockResolvedValue(mockBrand);

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrandById).toHaveBeenCalledWith(0);
    });

    it("should handle negative brand ID", async () => {
      mockRequest.params = { id: "-5" };

      mockBrandService.getBrandById.mockResolvedValue(mockBrand);

      await getBrandById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getBrandById).toHaveBeenCalledWith(-5);
    });
  });

  describe("updateBrand", () => {
    it("should update a brand successfully without file", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {
        name: "Updated Brand",
        description: "Updated description",
      };
      mockRequest.file = undefined;

      const updatedBrand = { ...mockBrand, name: "Updated Brand", description: "Updated description" };
      mockBrandService.updateBrand.mockResolvedValue(updatedBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: "Updated Brand",
        description: "Updated description",
        imageUrl: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedBrand,
      });
    });

    it("should update a brand successfully with file", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {
        name: "Updated Brand with Image",
      };
      mockRequest.file = mockFile;

      const uploadedUrl = "https://cloudinary.com/new-image.jpg";
      mockUploadToCloudinary.mockResolvedValue(uploadedUrl);
      const updatedBrand = { ...mockBrand, name: "Updated Brand with Image", imageUrl: uploadedUrl };
      mockBrandService.updateBrand.mockResolvedValue(updatedBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "image");
      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: "Updated Brand with Image",
        description: undefined,
        imageUrl: uploadedUrl,
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {
        name: "New Name Only",
      };
      mockRequest.file = undefined;

      const nameUpdatedBrand = { ...mockBrand, name: "New Name Only" };
      mockBrandService.updateBrand.mockResolvedValue(nameUpdatedBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: "New Name Only",
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should update only description", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {
        description: "New description only",
      };
      mockRequest.file = undefined;

      const descUpdatedBrand = { ...mockBrand, description: "New description only" };
      mockBrandService.updateBrand.mockResolvedValue(descUpdatedBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: undefined,
        description: "New description only",
        imageUrl: undefined,
      });
    });

    it("should update with empty description", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {
        name: "Brand with empty desc",
        description: "",
      };
      mockRequest.file = undefined;

      const emptyDescBrand = { ...mockBrand, name: "Brand with empty desc", description: "" };
      mockBrandService.updateBrand.mockResolvedValue(emptyDescBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: "Brand with empty desc",
        description: "",
        imageUrl: undefined,
      });
    });

    it("should handle invalid brand ID", async () => {
      mockRequest.params = { id: "invalid" };
      mockRequest.body = { name: "Updated Brand" };
      mockRequest.file = undefined;

      mockBrandService.updateBrand.mockRejectedValue(new Error("Invalid brand ID"));

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = { name: "Updated Brand" };
      mockRequest.file = undefined;

      mockBrandService.updateBrand.mockRejectedValue(new Error("Service error"));

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle file upload errors", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = { name: "Updated Brand" };
      mockRequest.file = mockFile;

      mockUploadToCloudinary.mockRejectedValue(new Error("Upload failed"));

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty update body", async () => {
      mockRequest.params = { id: mockBrandId };
      mockRequest.body = {};
      mockRequest.file = undefined;

      mockBrandService.updateBrand.mockResolvedValue(mockBrand);

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.updateBrand).toHaveBeenCalledWith(123, {
        name: undefined,
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should handle missing brand ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Updated Brand" };
      mockRequest.file = undefined;

      mockBrandService.updateBrand.mockRejectedValue(new Error("Missing brand ID"));

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN brand ID", async () => {
      mockRequest.params = { id: "NaN" };
      mockRequest.body = { name: "Updated Brand" };
      mockRequest.file = undefined;

      mockBrandService.updateBrand.mockRejectedValue(new Error("Invalid brand ID"));

      await updateBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("deleteBrand", () => {
    it("should delete a brand successfully", async () => {
      mockRequest.params = { id: mockBrandId };

      mockBrandService.deleteBrand.mockResolvedValue(null as any);

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.deleteBrand).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Brand deleted successfully",
      });
    });

    it("should handle invalid brand ID", async () => {
      mockRequest.params = { id: "invalid" };

      mockBrandService.deleteBrand.mockRejectedValue(new Error("Invalid brand ID"));

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockBrandId };

      mockBrandService.deleteBrand.mockRejectedValue(new Error("Service error"));

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing brand ID", async () => {
      mockRequest.params = {};

      mockBrandService.deleteBrand.mockRejectedValue(new Error("Missing brand ID"));

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN brand ID", async () => {
      mockRequest.params = { id: "NaN" };

      mockBrandService.deleteBrand.mockRejectedValue(new Error("Invalid brand ID"));

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle zero brand ID", async () => {
      mockRequest.params = { id: "0" };

      mockBrandService.deleteBrand.mockResolvedValue(null as any);

      await deleteBrand(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.deleteBrand).toHaveBeenCalledWith(0);
    });
  });

  describe("exportBrandsCSV", () => {
    const mockAllBrands = [
      mockBrand,
      { ...mockBrand, id: 124, name: "Brand 2", description: "Another brand" },
    ];

    it("should export brands to CSV successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockBrandService.getAllBrands.mockResolvedValue(mockAllBrands);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockBrandService.getAllBrands).toHaveBeenCalledWith(1);
      expect(MockParser).toHaveBeenCalledWith({
        fields: ["id", "name", "description", "imageUrl", "createdAt"],
      });
      expect(mockParserInstance.parse).toHaveBeenCalledWith(mockAllBrands);
      expect(mockResponse.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(mockResponse.attachment).toHaveBeenCalledWith("brands.csv");
      expect(mockResponse.send).toHaveBeenCalledWith("csv,data");
    });

    it("should handle brands with null imageUrl", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const brandWithNullImage = { ...mockBrand, imageUrl: null };
      mockBrandService.getAllBrands.mockResolvedValue([brandWithNullImage]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([brandWithNullImage]);
    });

    it("should handle brands with undefined description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const brandWithUndefinedDesc = { ...mockBrand, description: null };
      mockBrandService.getAllBrands.mockResolvedValue([brandWithUndefinedDesc]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([brandWithUndefinedDesc]);
    });

    it("should handle brands with empty description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const brandWithEmptyDesc = { ...mockBrand, description: "" };
      mockBrandService.getAllBrands.mockResolvedValue([brandWithEmptyDesc]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([brandWithEmptyDesc]);
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };

      mockBrandService.getAllBrands.mockRejectedValue(new Error("Invalid store ID"));

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockBrandService.getAllBrands.mockRejectedValue(new Error("Service error"));

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty brands list", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockBrandService.getAllBrands.mockResolvedValue([]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue(""),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([]);
      expect(mockResponse.send).toHaveBeenCalledWith("");
    });

    it("should handle CSV parsing errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockBrandService.getAllBrands.mockResolvedValue(mockAllBrands);
      
      const mockParserInstance = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error("CSV parsing error");
        }),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportBrandsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
