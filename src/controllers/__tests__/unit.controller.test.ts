import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  exportUnitsCSV,
} from "../unit.controller";
import { unitService } from "../../services/unit.service";
import { Request, Response, NextFunction } from "express";
import { Parser } from "json2csv";

// Mock dependencies
jest.mock("../../services/unit.service");
jest.mock("json2csv");

const mockUnitService = unitService as jest.Mocked<typeof unitService>;
const MockParser = Parser as jest.MockedClass<typeof Parser>;

describe("Unit Controller", () => {
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
  const mockUnitId = "123";
  const mockUnit = {
    id: 123,
    name: "Test Unit",
    status: "active",
    storeId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createUnit", () => {
    it("should create a unit successfully with all fields", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Test Unit",
        status: "active",
      };

      mockUnitService.createUnit.mockResolvedValue(mockUnit);

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.createUnit).toHaveBeenCalledWith(1, {
        name: "Test Unit",
        status: "active",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUnit,
      });
    });

    it("should create a unit with only name", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Minimal Unit",
      };

      const minimalUnit = { ...mockUnit, name: "Minimal Unit", status: "active" };
      mockUnitService.createUnit.mockResolvedValue(minimalUnit);

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.createUnit).toHaveBeenCalledWith(1, {
        name: "Minimal Unit",
        status: undefined,
      });
    });

    it("should create a unit with different status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Inactive Unit",
        status: "inactive",
      };

      const inactiveUnit = { ...mockUnit, name: "Inactive Unit", status: "inactive" };
      mockUnitService.createUnit.mockResolvedValue(inactiveUnit);

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.createUnit).toHaveBeenCalledWith(1, {
        name: "Inactive Unit",
        status: "inactive",
      });
    });

    it("should create a unit with empty status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {
        name: "Empty Status Unit",
        status: "",
      };

      const emptyStatusUnit = { ...mockUnit, name: "Empty Status Unit", status: "active" };
      mockUnitService.createUnit.mockResolvedValue(emptyStatusUnit);

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.createUnit).toHaveBeenCalledWith(1, {
        name: "Empty Status Unit",
        status: "",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = { name: "Test Unit" };

      mockUnitService.createUnit.mockRejectedValue(new Error("Service error"));

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing store ID", async () => {
      mockRequest.params = {};
      mockRequest.body = { name: "Test Unit" };

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN store ID", async () => {
      mockRequest.params = { storeId: "NaN" };
      mockRequest.body = { name: "Test Unit" };

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty body", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.body = {};

      await createUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.createUnit).toHaveBeenCalledWith(1, {
        name: undefined,
        status: undefined,
      });
    });
  });

  describe("getUnits", () => {
    const mockUnitsResult = {
      units: [mockUnit],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it("should get units with default pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: undefined,
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUnitsResult,
      });
    });

    it("should get units with search, status, and pagination", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "Test",
        status: "active",
        page: "2",
        limit: "5",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: "Test",
        status: "active",
        page: 2,
        limit: 5,
      });
    });

    it("should get units with only search", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "Unit Name",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: "Unit Name",
        status: undefined,
        page: 1,
        limit: 10,
      });
    });

    it("should get units with only status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        status: "inactive",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: "inactive",
        page: 1,
        limit: 10,
      });
    });

    it("should get units with empty search", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        search: "",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: "",
        status: undefined,
        page: 1,
        limit: 10,
      });
    });

    it("should get units with empty status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        status: "",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: "",
        page: 1,
        limit: 10,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {};

      mockUnitService.getUnits.mockRejectedValue(new Error("Service error"));

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle invalid page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "invalid",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: undefined,
        page: NaN,
        limit: 10,
      });
    });

    it("should handle invalid limit number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        limit: "invalid",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: undefined,
        page: 1,
        limit: NaN,
      });
    });

    it("should handle zero page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "0",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: undefined,
        page: 0,
        limit: 10,
      });
    });

    it("should handle negative page number", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockRequest.query = {
        page: "-5",
      };

      mockUnitService.getUnits.mockResolvedValue(mockUnitsResult);

      await getUnits(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnits).toHaveBeenCalledWith(1, {
        search: undefined,
        status: undefined,
        page: -5,
        limit: 10,
      });
    });
  });

  describe("getUnitById", () => {
    it("should get a unit by ID successfully", async () => {
      mockRequest.params = { id: mockUnitId };

      mockUnitService.getUnitById.mockResolvedValue(mockUnit);

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnitById).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUnit,
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockUnitId };

      mockUnitService.getUnitById.mockRejectedValue(new Error("Service error"));

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing unit ID", async () => {
      mockRequest.params = {};

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN unit ID", async () => {
      mockRequest.params = { id: "NaN" };

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle zero unit ID", async () => {
      mockRequest.params = { id: "0" };

      mockUnitService.getUnitById.mockResolvedValue(mockUnit);

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnitById).toHaveBeenCalledWith(0);
    });

    it("should handle negative unit ID", async () => {
      mockRequest.params = { id: "-5" };

      mockUnitService.getUnitById.mockResolvedValue(mockUnit);

      await getUnitById(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getUnitById).toHaveBeenCalledWith(-5);
    });
  });

  describe("updateUnit", () => {
    it("should update a unit successfully with all fields", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = {
        name: "Updated Unit",
        status: "inactive",
      };

      const updatedUnit = { ...mockUnit, name: "Updated Unit", status: "inactive" };
      mockUnitService.updateUnit.mockResolvedValue(updatedUnit);

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.updateUnit).toHaveBeenCalledWith(123, {
        name: "Updated Unit",
        status: "inactive",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: updatedUnit,
      });
    });

    it("should update only name", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = {
        name: "New Name Only",
      };

      const nameUpdatedUnit = { ...mockUnit, name: "New Name Only" };
      mockUnitService.updateUnit.mockResolvedValue(nameUpdatedUnit);

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.updateUnit).toHaveBeenCalledWith(123, {
        name: "New Name Only",
        status: undefined,
      });
    });

    it("should update only status", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = {
        status: "pending",
      };

      const statusUpdatedUnit = { ...mockUnit, status: "pending" };
      mockUnitService.updateUnit.mockResolvedValue(statusUpdatedUnit);

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.updateUnit).toHaveBeenCalledWith(123, {
        name: undefined,
        status: "pending",
      });
    });

    it("should update with empty status", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = {
        name: "Unit with empty status",
        status: "",
      };

      const emptyStatusUnit = { ...mockUnit, name: "Unit with empty status", status: "" };
      mockUnitService.updateUnit.mockResolvedValue(emptyStatusUnit);

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.updateUnit).toHaveBeenCalledWith(123, {
        name: "Unit with empty status",
        status: "",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = { name: "Updated Unit" };

      mockUnitService.updateUnit.mockRejectedValue(new Error("Service error"));

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty update body", async () => {
      mockRequest.params = { id: mockUnitId };
      mockRequest.body = {};

      mockUnitService.updateUnit.mockResolvedValue(mockUnit);

      await updateUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.updateUnit).toHaveBeenCalledWith(123, {
        name: undefined,
        status: undefined,
      });
    });
  });

  describe("deleteUnit", () => {
    it("should delete a unit successfully", async () => {
      mockRequest.params = { id: mockUnitId };

      mockUnitService.deleteUnit.mockResolvedValue(mockUnit);

      await deleteUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.deleteUnit).toHaveBeenCalledWith(123);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: "Unit deleted successfully",
      });
    });

    it("should handle service errors", async () => {
      mockRequest.params = { id: mockUnitId };

      mockUnitService.deleteUnit.mockRejectedValue(new Error("Service error"));

      await deleteUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle missing unit ID", async () => {
      mockRequest.params = {};

      await deleteUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle NaN unit ID", async () => {
      mockRequest.params = { id: "NaN" };

      await deleteUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle zero unit ID", async () => {
      mockRequest.params = { id: "0" };

      mockUnitService.deleteUnit.mockResolvedValue(mockUnit);

      await deleteUnit(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.deleteUnit).toHaveBeenCalledWith(0);
    });
  });

  describe("exportUnitsCSV", () => {
    const mockAllUnits = [
      mockUnit,
      { ...mockUnit, id: 124, name: "Unit 2", status: "inactive" },
    ];

    it("should export units to CSV successfully", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockUnitService.getAllUnits.mockResolvedValue(mockAllUnits);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockUnitService.getAllUnits).toHaveBeenCalledWith(1);
      expect(MockParser).toHaveBeenCalledWith({
        fields: ["id", "name", "status", "createdAt"],
      });
      expect(mockParserInstance.parse).toHaveBeenCalledWith(mockAllUnits);
      expect(mockResponse.header).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(mockResponse.attachment).toHaveBeenCalledWith("units.csv");
      expect(mockResponse.send).toHaveBeenCalledWith("csv,data");
    });

    it("should handle units with null status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const unitWithNullStatus = { ...mockUnit, status: "" };
      mockUnitService.getAllUnits.mockResolvedValue([unitWithNullStatus]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([unitWithNullStatus]);
    });

    it("should handle units with empty status", async () => {
      mockRequest.params = { storeId: mockStoreId };
      const unitWithEmptyStatus = { ...mockUnit, status: "" };
      mockUnitService.getAllUnits.mockResolvedValue([unitWithEmptyStatus]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue("csv,data"),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([unitWithEmptyStatus]);
    });

    it("should handle service errors", async () => {
      mockRequest.params = { storeId: mockStoreId };

      mockUnitService.getAllUnits.mockRejectedValue(new Error("Service error"));

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle empty units list", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockUnitService.getAllUnits.mockResolvedValue([]);
      
      const mockParserInstance = {
        parse: jest.fn().mockReturnValue(""),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockParserInstance.parse).toHaveBeenCalledWith([]);
      expect(mockResponse.send).toHaveBeenCalledWith("");
    });

    it("should handle CSV parsing errors", async () => {
      mockRequest.params = { storeId: mockStoreId };
      mockUnitService.getAllUnits.mockResolvedValue(mockAllUnits);
      
      const mockParserInstance = {
        parse: jest.fn().mockImplementation(() => {
          throw new Error("CSV parsing error");
        }),
      } as any;
      MockParser.mockImplementation(() => mockParserInstance);

      await exportUnitsCSV(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
