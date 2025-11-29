import {
  createProductGroup,
  getProductGroups,
  getProductGroupById,
  updateProductGroup,
  deleteProductGroup,
  exportProductGroupsCSV,
} from "../productGroup.controller";
import { productGroupService } from "../../services/productGroup.service";
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";

// Mock dependencies
jest.mock("../../services/productGroup.service");
jest.mock("../../utils/cloudinary");
jest.mock("json2csv");

const mockProductGroupService = productGroupService as jest.Mocked<typeof productGroupService>;
const MockParser = Parser as jest.MockedClass<typeof Parser>;
const mockUploadToCloudinary = jest.fn();

describe("Product Group Controller", () => {
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
  const mockGroupId = "123";
  const mockGroup = {
    id: 123,
    name: "Test Group",
    description: "A test product group",
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

  describe("createProductGroup", () => {
    it("should create a product group successfully without file", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Group",
        description: "A test product group",
      };
      mockRequest.file = undefined;

      mockProductGroupService.createProductGroup.mockResolvedValue(mockGroup);

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.createProductGroup).toHaveBeenCalledWith(1, {
        name: "Test Group",
        description: "A test product group",
        imageUrl: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroup,
      });
    });

    it("should create a product group successfully with file", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Group with Image",
        description: "A test product group with image",
      };
      mockRequest.file = mockFile;

      const uploadedUrl = "https://cloudinary.com/uploaded-image.jpg";
      mockUploadToCloudinary.mockResolvedValue(uploadedUrl);
      mockProductGroupService.createProductGroup.mockResolvedValue(mockGroup);

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "image");
      expect(mockProductGroupService.createProductGroup).toHaveBeenCalledWith(1, {
        name: "Test Group with Image",
        description: "A test product group with image",
        imageUrl: uploadedUrl,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroup,
      });
    });

    it("should create a product group with only name", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Minimal Group",
      };
      mockRequest.file = undefined;

      const minimalGroup = { ...mockGroup, name: "Minimal Group", description: null };
      mockProductGroupService.createProductGroup.mockResolvedValue(minimalGroup);

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.createProductGroup).toHaveBeenCalledWith(1, {
        name: "Minimal Group",
        description: null,
        imageUrl: undefined,
      });
    });

    it("should create a product group with only description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        description: "Only description group",
      };
      mockRequest.file = undefined;

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.createProductGroup).toHaveBeenCalledWith(1, {
        name: undefined,
        description: "Only description group",
        imageUrl: undefined,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.body = { name: "Test Group" };
      mockRequest.file = undefined;

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Group" };
      mockRequest.file = undefined;

      mockProductGroupService.createProductGroup.mockRejectedValue(new Error("Service error"));

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle file upload errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Group" };
      mockRequest.file = mockFile;

      mockUploadToCloudinary.mockRejectedValue(new Error("Upload failed"));

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Test Group" };
      mockRequest.file = undefined;

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = { name: "Test Group" };
      mockRequest.file = undefined;

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle empty body", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {};
      mockRequest.file = undefined;

      mockProductGroupService.createProductGroup.mockResolvedValue(mockGroup);

      await createProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.createProductGroup).toHaveBeenCalledWith(1, {
        name: undefined,
        description: undefined,
        imageUrl: undefined,
      });
    });
  });

  describe("getProductGroups", () => {
    const mockGroupsResult = {
      groups: [mockGroup],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it("should get product groups with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductGroupService.getProductGroups.mockResolvedValue(mockGroupsResult);

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroups).toHaveBeenCalledWith(1, {
        search: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroupsResult,
      });
    });

    it("should get product groups with search and pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "Test",
        page: "2",
        limit: "5",
      };

      mockProductGroupService.getProductGroups.mockResolvedValue(mockGroupsResult);

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroups).toHaveBeenCalledWith(1, {
        search: "Test",
        page: 2,
        limit: 5,
      });
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };
      mockRequest.query = {};

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockProductGroupService.getProductGroups.mockRejectedValue(new Error("Service error"));

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockProductGroupService.getProductGroups.mockResolvedValue(mockGroupsResult);

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroups).toHaveBeenCalledWith(1, {
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

      mockProductGroupService.getProductGroups.mockResolvedValue(mockGroupsResult);

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroups).toHaveBeenCalledWith(1, {
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

      mockProductGroupService.getProductGroups.mockResolvedValue(mockGroupsResult);

      await getProductGroups(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroups).toHaveBeenCalledWith(1, {
        search: "",
        page: 1,
        limit: 10,
      });
    });
  });

  describe("getProductGroupById", () => {
    it("should get a product group by ID successfully", async () => {
      mockRequest.params = { id: mockGroupId };

      mockProductGroupService.getProductGroupById.mockResolvedValue(mockGroup);

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroupById).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockGroup,
      });
    });

    it("should handle invalid group ID", async () => {
      mockRequest.params = { id: "invalid" };

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockGroupId };

      mockProductGroupService.getProductGroupById.mockRejectedValue(new Error("Service error"));

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle missing group ID", async () => {
      mockRequest.params = {};

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle NaN group ID", async () => {
      mockRequest.params = { id: "NaN" };

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle zero group ID", async () => {
      mockRequest.params = { id: "0" };

      mockProductGroupService.getProductGroupById.mockResolvedValue(mockGroup);

      await getProductGroupById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getProductGroupById).toHaveBeenCalledWith(0);
    });
  });

  describe("updateProductGroup", () => {
    it("should update a product group successfully without file", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = {
        name: "Updated Group",
        description: "Updated description",
      };
      mockRequest.file = undefined;

      const updatedGroup = { ...mockGroup, name: "Updated Group", description: "Updated description" };
      mockProductGroupService.updateProductGroup.mockResolvedValue(updatedGroup);

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.updateProductGroup).toHaveBeenCalledWith(123, {
        name: "Updated Group",
        description: "Updated description",
        imageUrl: undefined,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedGroup,
      });
    });

    it("should update a product group successfully with file", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = {
        name: "Updated Group with Image",
      };
      mockRequest.file = mockFile;

      const uploadedUrl = "https://cloudinary.com/new-image.jpg";
      mockUploadToCloudinary.mockResolvedValue(uploadedUrl);
      const updatedGroup = { ...mockGroup, name: "Updated Group with Image", imageUrl: uploadedUrl };
      mockProductGroupService.updateProductGroup.mockResolvedValue(updatedGroup);

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUploadToCloudinary).toHaveBeenCalledWith(mockFile, "image");
      expect(mockProductGroupService.updateProductGroup).toHaveBeenCalledWith(123, {
        name: "Updated Group with Image",
        description: undefined,
        imageUrl: uploadedUrl,
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = {
        name: "New Name Only",
      };
      mockRequest.file = undefined;

      const nameUpdatedGroup = { ...mockGroup, name: "New Name Only" };
      mockProductGroupService.updateProductGroup.mockResolvedValue(nameUpdatedGroup);

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.updateProductGroup).toHaveBeenCalledWith(123, {
        name: "New Name Only",
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should update only description", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = {
        description: "New description only",
      };
      mockRequest.file = undefined;

      const descUpdatedGroup = { ...mockGroup, description: "New description only" };
      mockProductGroupService.updateProductGroup.mockResolvedValue(descUpdatedGroup);

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.updateProductGroup).toHaveBeenCalledWith(123, {
        name: undefined,
        description: "New description only",
        imageUrl: undefined,
      });
    });

    it("should handle invalid group ID", async () => {
      mockRequest.params = { id: "invalid" };
      mockRequest.body = { name: "Updated Group" };
      mockRequest.file = undefined;

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = { name: "Updated Group" };
      mockRequest.file = undefined;

      mockProductGroupService.updateProductGroup.mockRejectedValue(new Error("Service error"));

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle file upload errors", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = { name: "Updated Group" };
      mockRequest.file = mockFile;

      mockUploadToCloudinary.mockRejectedValue(new Error("Upload failed"));

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle empty update body", async () => {
      mockRequest.params = { id: mockGroupId };
      mockRequest.body = {};
      mockRequest.file = undefined;

      mockProductGroupService.updateProductGroup.mockResolvedValue(mockGroup);

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.updateProductGroup).toHaveBeenCalledWith(123, {
        name: undefined,
        description: undefined,
        imageUrl: undefined,
      });
    });

    it("should handle missing group ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Updated Group" };
      mockRequest.file = undefined;

      await updateProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("deleteProductGroup", () => {
    it("should delete a product group successfully", async () => {
      mockRequest.params = { id: mockGroupId };

      mockProductGroupService.deleteProductGroup.mockResolvedValue(null as any);

      await deleteProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.deleteProductGroup).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Product group deleted successfully",
      });
    });

    it("should handle invalid group ID", async () => {
      mockRequest.params = { id: "invalid" };

      await deleteProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockGroupId };

      mockProductGroupService.deleteProductGroup.mockRejectedValue(new Error("Service error"));

      await deleteProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle missing group ID", async () => {
      mockRequest.params = {};

      await deleteProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle NaN group ID", async () => {
      mockRequest.params = { id: "NaN" };

      await deleteProductGroup(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });

  describe("exportProductGroupsCSV", () => {
    const mockAllGroups = [
      mockGroup,
      { ...mockGroup, id: 124, name: "Group 2", description: "Another group" },
    ];

    it("should export product groups to CSV successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockProductGroupService.getAllProductGroups.mockResolvedValue(mockAllGroups);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockProductGroupService.getAllProductGroups).toHaveBeenCalledWith(1);
      expect(MockParser).toHaveBeenCalledWith({
        fields: ["id", "name", "description", "imageUrl", "createdAt"],
      });
      expect(mockParserInstance.parse).toHaveBeenCalledWith(mockAllGroups);
      expect(mockResponse.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(mockResponse.attachment).toHaveBeenCalledWith("product-groups.csv");
      expect(mockResponse.send).toHaveBeenCalledWith("csv,data");
    });

    it("should handle groups with null imageUrl", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const groupWithNullImage = { ...mockGroup, imageUrl: null };
      mockProductGroupService.getAllProductGroups.mockResolvedValue([groupWithNullImage]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([groupWithNullImage]);
    });

    it("should handle groups with undefined description", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const groupWithUndefinedDesc = { ...mockGroup, description: null };
      mockProductGroupService.getAllProductGroups.mockResolvedValue([groupWithUndefinedDesc]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([groupWithUndefinedDesc]);
    });

    it("should handle invalid store ID", async () => {
      mockRequest.params = { storeId: "invalid" };

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockProductGroupService.getAllProductGroups.mockRejectedValue(new Error("Service error"));

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should handle empty groups list", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockProductGroupService.getAllProductGroups.mockResolvedValue([]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue(""),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([]);
      expect(mockResponse.send).toHaveBeenCalledWith("");
    });

    it("should handle CSV parsing errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockProductGroupService.getAllProductGroups.mockResolvedValue(mockAllGroups);
      
      const mockParserInstance = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error("CSV parsing error");
        }),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportProductGroupsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
