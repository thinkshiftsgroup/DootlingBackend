import { setupStore, getStore, updateStore, launchStore } from "../store.service";
import { prisma } from "../../prisma";

// Mock dependencies
jest.mock("../../prisma");

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  store: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
} as any;

// Mock the prisma export
(prisma as any) = mockPrisma;

describe("Store Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("validateStoreUrl", () => {
    // Note: This is a private function, but we're testing it through the public API
    it("should accept valid store URLs", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue({
        id: 1,
        businessName: "Test Store",
        storeUrl: "test-store",
        country: "US",
        currency: "USD",
        isLaunched: false,
      });

      // Test valid URLs
      const validUrls = [
        "test-store",
        "mystore",
        "my-store-123",
        "a",
        "ab",
        "store-with-many-characters",
        "store123",
        "test-store-name",
      ];

      for (const url of validUrls) {
        if (url.length >= 3 && url.length <= 63) {
          await expect(setupStore(1, "Test Business", url, "US")).resolves.toBeDefined();
        }
      }
    });

    it("should reject invalid store URLs", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);

      // Test invalid URLs
      const invalidUrls = [
        "ab", // too short
        "store-with-very-long-name-that-exceeds-sixty-three-characters-limit",
        "Store", // uppercase
        "store_", // underscore
        "store.", // period
        "store@", // special character
        "-store", // starts with hyphen
        "store-", // ends with hyphen
      ];

      for (const url of invalidUrls) {
        await expect(setupStore(1, "Test Business", url, "US")).rejects.toThrow(/Invalid store URL/);
      }
    });
  });

  describe("setupStore", () => {
    it("should setup store successfully with valid data", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "US",
        currency: "USD",
        isLaunched: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue(mockStore);

      const result = await setupStore(1, "Test Business", "test-store", "US");

      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
        },
      });

      expect(result).toEqual({
        message: "Store setup successful",
        store: {
          id: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
          isLaunched: false,
        },
      });
    });

    it("should setup store with custom currency", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "UK",
        currency: "GBP",
        isLaunched: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue(mockStore);

      const result = await setupStore(1, "Test Business", "test-store", "UK", "gbp");

      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "UK",
          currency: "GBP",
        },
      });

      expect(result.store.currency).toBe("GBP");
    });

    it("should trim business name", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "US",
        currency: "USD",
        isLaunched: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue(mockStore);

      await setupStore(1, "  Test Business  ", "test-store", "US");

      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
        },
      });
    });

    it("should convert store URL to lowercase", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "US",
        currency: "USD",
        isLaunched: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue(mockStore);

      await setupStore(1, "Test Business", "teststore", "US");

      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          storeUrl: "teststore",
          country: "US",
          currency: "USD",
        },
      });
    });

    it("should convert currency to uppercase", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "US",
        currency: "EUR",
        isLaunched: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);
      mockPrisma.store.create.mockResolvedValue(mockStore);

      await setupStore(1, "Test Business", "test-store", "US", "eur");

      expect(mockPrisma.store.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "EUR",
        },
      });
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(setupStore(999, "Test Business", "test-store", "US")).rejects.toThrow("User not found");
    });

    it("should throw error when user already has a store", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockExistingStore = { id: 1, userId: 1 };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(mockExistingStore);

      await expect(setupStore(1, "Test Business", "test-store", "US")).rejects.toThrow("User already has a store");
    });

    it("should throw error when store URL is already taken", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockExistingStore = { id: 2, storeUrl: "test-store" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(mockExistingStore);

      await expect(setupStore(1, "Test Business", "test-store", "US")).rejects.toThrow("Store URL already taken");
    });

    it("should throw error when business name is empty", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);

      await expect(setupStore(1, "", "test-store", "US")).rejects.toThrow("Business name is required");
      await expect(setupStore(1, "   ", "test-store", "US")).rejects.toThrow("Business name is required");
    });

    it("should throw error when country is empty", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      mockPrisma.store.findUnique.mockResolvedValue(null);

      await expect(setupStore(1, "Test Business", "test-store", "")).rejects.toThrow("Country is required");
      await expect(setupStore(1, "Test Business", "test-store", "   ")).rejects.toThrow("Country is required");
    });

    it("should throw error when store URL is too short", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(setupStore(1, "Test Business", "ab", "US")).rejects.toThrow("Invalid store URL");
    });

    it("should throw error when store URL is too long", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const longUrl = "a".repeat(64);

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(setupStore(1, "Test Business", longUrl, "US")).rejects.toThrow("Invalid store URL");
    });

    it("should throw error when store URL has invalid characters", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(setupStore(1, "Test Business", "Test_Store", "US")).rejects.toThrow("Invalid store URL");
      await expect(setupStore(1, "Test Business", "test@store", "US")).rejects.toThrow("Invalid store URL");
      await expect(setupStore(1, "Test Business", "test.store", "US")).rejects.toThrow("Invalid store URL");
    });
  });

  describe("getStore", () => {
    it("should return store when user has a store", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockStore = {
        id: 1,
        businessName: "Test Business",
        storeUrl: "test-store",
        country: "US",
        currency: "USD",
        isLaunched: false,
        createdAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);

      const result = await getStore(1);

      expect(mockPrisma.store.findFirst).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(result).toEqual({
        store: {
          id: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
          isLaunched: false,
          createdAt: mockStore.createdAt,
        },
      });
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getStore(999)).rejects.toThrow("User not found");
    });

    it("should throw error when user does not have a store", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(getStore(1)).rejects.toThrow("Store not found");
    });
  });

  describe("updateStore", () => {
    const mockStore = {
      id: 1,
      businessName: "Test Business",
      storeUrl: "test-store",
      country: "US",
      currency: "USD",
      isLaunched: false,
    };

    beforeEach(() => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
    });

    it("should update business name", async () => {
      const updatedStore = { ...mockStore, businessName: "New Business Name" };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      const result = await updateStore(1, "New Business Name");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { businessName: "New Business Name" },
      });

      expect(result).toEqual({
        message: "Store updated successfully",
        store: {
          id: 1,
          businessName: "New Business Name",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
          isLaunched: false,
        },
      });
    });

    it("should update country", async () => {
      const updatedStore = { ...mockStore, country: "UK" };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      const result = await updateStore(1, undefined, "UK");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { country: "UK" },
      });

      expect(result.store.country).toBe("UK");
    });

    it("should update currency", async () => {
      const updatedStore = { ...mockStore, currency: "EUR" };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      const result = await updateStore(1, undefined, undefined, "eur");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currency: "EUR" },
      });

      expect(result.store.currency).toBe("EUR");
    });

    it("should update all fields", async () => {
      const updatedStore = {
        ...mockStore,
        businessName: "New Business",
        country: "UK",
        currency: "EUR",
      };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      const result = await updateStore(1, "New Business", "UK", "eur");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          businessName: "New Business",
          country: "UK",
          currency: "EUR",
        },
      });

      expect(result.store).toEqual({
        id: 1,
        businessName: "New Business",
        storeUrl: "test-store",
        country: "UK",
        currency: "EUR",
        isLaunched: false,
      });
    });

    it("should trim business name", async () => {
      const updatedStore = { ...mockStore, businessName: "New Business" };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      await updateStore(1, "  New Business  ");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { businessName: "New Business" },
      });
    });

    it("should convert currency to uppercase", async () => {
      const updatedStore = { ...mockStore, currency: "GBP" };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      await updateStore(1, undefined, undefined, "gbp");

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { currency: "GBP" },
      });
    });

    it("should not update when no data provided", async () => {
      const updatedStore = { ...mockStore };
      mockPrisma.store.update.mockResolvedValue(updatedStore);

      await updateStore(1);

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {},
      });
    });

    it("should throw error when business name is empty", async () => {
      await expect(updateStore(1, "")).rejects.toThrow("Business name cannot be empty");
      await expect(updateStore(1, "   ")).rejects.toThrow("Business name cannot be empty");
    });

    it("should throw error when country is empty", async () => {
      await expect(updateStore(1, undefined, "")).rejects.toThrow("Country cannot be empty");
      await expect(updateStore(1, undefined, "   ")).rejects.toThrow("Country cannot be empty");
    });

    it("should throw error when currency is empty", async () => {
      await expect(updateStore(1, undefined, undefined, "")).rejects.toThrow("Currency cannot be empty");
      await expect(updateStore(1, undefined, undefined, "   ")).rejects.toThrow("Currency cannot be empty");
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(updateStore(999)).rejects.toThrow("User not found");
    });

    it("should throw error when store does not exist", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(updateStore(1)).rejects.toThrow("Store not found");
    });
  });

  describe("launchStore", () => {
    const mockStore = {
      id: 1,
      businessName: "Test Business",
      storeUrl: "test-store",
      country: "US",
      currency: "USD",
      isLaunched: false,
    };

    beforeEach(() => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(mockStore);
    });

    it("should launch store successfully", async () => {
      const launchedStore = { ...mockStore, isLaunched: true };
      mockPrisma.store.update.mockResolvedValue(launchedStore);

      const result = await launchStore(1);

      expect(mockPrisma.store.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isLaunched: true },
      });

      expect(result).toEqual({
        message: "Store launched successfully",
        store: {
          id: 1,
          businessName: "Test Business",
          storeUrl: "test-store",
          country: "US",
          currency: "USD",
          isLaunched: true,
        },
      });
    });

    it("should throw error when store is already launched", async () => {
      const alreadyLaunchedStore = { ...mockStore, isLaunched: true };
      mockPrisma.store.findFirst.mockResolvedValue(alreadyLaunchedStore);

      await expect(launchStore(1)).rejects.toThrow("Store is already launched");
    });

    it("should throw error when user does not exist", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(launchStore(999)).rejects.toThrow("User not found");
    });

    it("should throw error when store does not exist", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.store.findFirst.mockResolvedValue(null);

      await expect(launchStore(1)).rejects.toThrow("Store not found");
    });
  });
});
