import { unitService } from "../unit.service";
import { prisma } from "../../prisma";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  unit: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
} as any;

(prisma as any) = mockPrisma;

describe("Unit Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStoreId = 1;
  const mockUnitId = 1;

  const mockUnit = {
    id: mockUnitId,
    storeId: mockStoreId,
    name: "Test Unit",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("createUnit", () => {
    it("should create a unit with all fields", async () => {
      const createData = {
        name: "Test Unit",
        status: "active",
      };

      mockPrisma.unit.create.mockResolvedValue(mockUnit);

      const result = await unitService.createUnit(mockStoreId, createData);

      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Test Unit",
          status: "active",
        },
      });

      expect(result).toEqual(mockUnit);
    });

    it("should create a unit with default status", async () => {
      const createData = {
        name: "Unit without status",
      };

      const unitWithDefaultStatus = { ...mockUnit, name: "Unit without status", status: "active" };
      mockPrisma.unit.create.mockResolvedValue(unitWithDefaultStatus);

      const result = await unitService.createUnit(mockStoreId, createData);

      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Unit without status",
          status: "active",
        },
      });

      expect(result).toEqual(unitWithDefaultStatus);
    });

    it("should create a unit with custom status", async () => {
      const createData = {
        name: "Inactive Unit",
        status: "inactive",
      };

      const inactiveUnit = { ...mockUnit, name: "Inactive Unit", status: "inactive" };
      mockPrisma.unit.create.mockResolvedValue(inactiveUnit);

      const result = await unitService.createUnit(mockStoreId, createData);

      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Inactive Unit",
          status: "inactive",
        },
      });

      expect(result).toEqual(inactiveUnit);
    });

    it("should create a unit with different status values", async () => {
      const createData = {
        name: "Pending Unit",
        status: "pending",
      };

      const pendingUnit = { ...mockUnit, name: "Pending Unit", status: "pending" };
      mockPrisma.unit.create.mockResolvedValue(pendingUnit);

      await unitService.createUnit(mockStoreId, createData);

      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Pending Unit",
          status: "pending",
        },
      });
    });

    it("should create a unit with empty string status", async () => {
      const createData = {
        name: "Empty Status Unit",
        status: "",
      };

      const emptyStatusUnit = { ...mockUnit, name: "Empty Status Unit", status: "active" };
      mockPrisma.unit.create.mockResolvedValue(emptyStatusUnit);

      await unitService.createUnit(mockStoreId, createData);

      expect(mockPrisma.unit.create).toHaveBeenCalledWith({
        data: {
          storeId: mockStoreId,
          name: "Empty Status Unit",
          status: "active", // Empty string is falsy, so defaults to "active"
        },
      });
    });
  });

  describe("getUnits", () => {
    const mockUnits = [mockUnit, { ...mockUnit, id: 2, name: "Unit 2" }];

    it("should get units with default pagination", async () => {
      mockPrisma.unit.findMany.mockResolvedValue(mockUnits);
      mockPrisma.unit.count.mockResolvedValue(2);

      const result = await unitService.getUnits(mockStoreId, {});

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(mockPrisma.unit.count).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
      });

      expect(result).toEqual({
        units: mockUnits,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it("should get units with custom pagination", async () => {
      mockPrisma.unit.findMany.mockResolvedValue(mockUnits);
      mockPrisma.unit.count.mockResolvedValue(25);

      const result = await unitService.getUnits(mockStoreId, {
        page: 2,
        limit: 5,
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
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

    it("should search units by name", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await unitService.getUnits(mockStoreId, {
        search: "Test",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "Test", mode: "insensitive" },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(result.units).toHaveLength(1);
    });

    it("should filter units by status", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await unitService.getUnits(mockStoreId, {
        status: "active",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          status: "active",
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(result.units).toHaveLength(1);
    });

    it("should search units by name and filter by status", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      const result = await unitService.getUnits(mockStoreId, {
        search: "Test",
        status: "active",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "Test", mode: "insensitive" },
          status: "active",
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      expect(result.units).toHaveLength(1);
    });

    it("should handle search with pagination", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      await unitService.getUnits(mockStoreId, {
        search: "nonexistent",
        page: 3,
        limit: 20,
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "nonexistent", mode: "insensitive" },
        },
        skip: 40,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle status filter with pagination", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      await unitService.getUnits(mockStoreId, {
        status: "inactive",
        page: 2,
        limit: 15,
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          status: "inactive",
        },
        skip: 15,
        take: 15,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle empty search results", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      const result = await unitService.getUnits(mockStoreId, {
        search: "nonexistent",
      });

      expect(result.units).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("should handle case-insensitive search", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([mockUnit]);
      mockPrisma.unit.count.mockResolvedValue(1);

      await unitService.getUnits(mockStoreId, {
        search: "TEST UNIT",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          name: { contains: "TEST UNIT", mode: "insensitive" },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle different status values", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      await unitService.getUnits(mockStoreId, {
        status: "pending",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          status: "pending",
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("should handle empty string status", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);
      mockPrisma.unit.count.mockResolvedValue(0);

      await unitService.getUnits(mockStoreId, {
        status: "",
      });

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: {
          storeId: mockStoreId,
          // Empty string is falsy, so status won't be included in where clause
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getAllUnits", () => {
    it("should get all units for a store", async () => {
      const allUnits = [mockUnit, { ...mockUnit, id: 2 }, { ...mockUnit, id: 3 }];
      mockPrisma.unit.findMany.mockResolvedValue(allUnits);

      const result = await unitService.getAllUnits(mockStoreId);

      expect(mockPrisma.unit.findMany).toHaveBeenCalledWith({
        where: { storeId: mockStoreId },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toEqual(allUnits);
    });

    it("should handle empty units list", async () => {
      mockPrisma.unit.findMany.mockResolvedValue([]);

      const result = await unitService.getAllUnits(mockStoreId);

      expect(result).toEqual([]);
    });

    it("should return units ordered by creation date", async () => {
      const units = [
        { ...mockUnit, id: 3, createdAt: new Date("2023-01-01") },
        { ...mockUnit, id: 2, createdAt: new Date("2023-02-01") },
        { ...mockUnit, id: 1, createdAt: new Date("2023-03-01") },
      ];
      mockPrisma.unit.findMany.mockResolvedValue(units);

      const result = await unitService.getAllUnits(mockStoreId);

      expect(result).toEqual(units);
    });
  });

  describe("getUnitById", () => {
    it("should get a unit by id successfully", async () => {
      mockPrisma.unit.findUnique.mockResolvedValue(mockUnit);

      const result = await unitService.getUnitById(mockUnitId);

      expect(mockPrisma.unit.findUnique).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });

      expect(result).toEqual(mockUnit);
    });

    it("should throw error when unit not found", async () => {
      mockPrisma.unit.findUnique.mockResolvedValue(null);

      await expect(unitService.getUnitById(mockUnitId)).rejects.toThrow(
        "Unit not found"
      );

      expect(mockPrisma.unit.findUnique).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });
    });

    it("should handle database errors", async () => {
      mockPrisma.unit.findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(unitService.getUnitById(mockUnitId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("updateUnit", () => {
    it("should update all fields of a unit", async () => {
      const updateData = {
        name: "Updated Unit",
        status: "inactive",
      };

      const updatedUnit = { ...mockUnit, ...updateData };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      const result = await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          name: "Updated Unit",
          status: "inactive",
        },
      });

      expect(result).toEqual(updatedUnit);
    });

    it("should update only name", async () => {
      const updateData = { name: "New Name Only" };

      const updatedUnit = { ...mockUnit, name: "New Name Only" };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      const result = await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          name: "New Name Only",
        },
      });

      expect(result).toEqual(updatedUnit);
    });

    it("should update only status", async () => {
      const updateData = { status: "pending" };

      const updatedUnit = { ...mockUnit, status: "pending" };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          status: "pending",
        },
      });
    });

    it("should handle updating name and status together", async () => {
      const updateData = {
        name: "Name and Status Update",
        status: "inactive",
      };

      const updatedUnit = { ...mockUnit, ...updateData };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          name: "Name and Status Update",
          status: "inactive",
        },
      });
    });

    it("should handle empty update data", async () => {
      const updateData = {};

      mockPrisma.unit.update.mockResolvedValue(mockUnit);

      const result = await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {},
      });

      expect(result).toEqual(mockUnit);
    });

    it("should handle setting status to empty string", async () => {
      const updateData = { status: "" };

      const updatedUnit = { ...mockUnit, status: "" };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          // Empty string is falsy, so this field won't be included
        },
      });
    });

    it("should handle different status values in update", async () => {
      const updateData = { status: "archived" };

      const updatedUnit = { ...mockUnit, status: "archived" };
      mockPrisma.unit.update.mockResolvedValue(updatedUnit);

      await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {
          status: "archived",
        },
      });
    });

    it("should not update fields when not provided", async () => {
      const updateData = {};

      await unitService.updateUnit(mockUnitId, updateData);

      expect(mockPrisma.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: {},
      });
    });
  });

  describe("deleteUnit", () => {
    it("should delete a unit successfully", async () => {
      mockPrisma.unit.delete.mockResolvedValue(mockUnit);

      const result = await unitService.deleteUnit(mockUnitId);

      expect(mockPrisma.unit.delete).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });

      expect(result).toEqual(mockUnit);
    });

    it("should handle deletion of non-existent unit", async () => {
      mockPrisma.unit.delete.mockRejectedValue(new Error("Record to delete does not exist"));

      await expect(unitService.deleteUnit(mockUnitId)).rejects.toThrow(
        "Record to delete does not exist"
      );

      expect(mockPrisma.unit.delete).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });
    });

    it("should handle foreign key constraint errors", async () => {
      mockPrisma.unit.delete.mockRejectedValue(
        new Error("Foreign key constraint violation")
      );

      await expect(unitService.deleteUnit(mockUnitId)).rejects.toThrow(
        "Foreign key constraint violation"
      );
    });

    it("should handle database connection errors", async () => {
      mockPrisma.unit.delete.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(unitService.deleteUnit(mockUnitId)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });
});
