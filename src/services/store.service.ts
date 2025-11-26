import { prisma } from "../prisma";

const validateStoreUrl = (url: string): boolean => {
  const urlRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return urlRegex.test(url) && url.length >= 3 && url.length <= 63;
};

export const setupStore = async (userId: number, businessName: string, storeUrl: string, country: string, currency: string = "USD") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Check if user already has a store
  const existingUserStore = await prisma.store.findFirst({ where: { userId } });
  if (existingUserStore) throw new Error("User already has a store");

  // Validate store URL format
  if (!validateStoreUrl(storeUrl)) {
    throw new Error("Invalid store URL. Must be 3-63 characters, lowercase alphanumeric and hyphens only");
  }

  // Check if store URL is unique
  const existingStore = await prisma.store.findUnique({ where: { storeUrl } });
  if (existingStore) throw new Error("Store URL already taken");

  // Validate business name
  if (!businessName || businessName.trim().length === 0) {
    throw new Error("Business name is required");
  }

  if (!country || country.trim().length === 0) {
    throw new Error("Country is required");
  }

  const store = await prisma.store.create({
    data: {
      userId,
      businessName: businessName.trim(),
      storeUrl: storeUrl.toLowerCase(),
      country,
      currency: currency.toUpperCase(),
    },
  });

  return {
    message: "Store setup successful",
    store: {
      id: store.id,
      businessName: store.businessName,
      storeUrl: store.storeUrl,
      country: store.country,
      currency: store.currency,
      isLaunched: store.isLaunched,
    },
  };
};

export const getStore = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const store = await prisma.store.findFirst({ where: { userId } });
  if (!store) throw new Error("Store not found");

  return {
    store: {
      id: store.id,
      businessName: store.businessName,
      storeUrl: store.storeUrl,
      country: store.country,
      currency: store.currency,
      isLaunched: store.isLaunched,
      createdAt: store.createdAt,
    },
  };
};

export const updateStore = async (userId: number, businessName?: string, country?: string, currency?: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const store = await prisma.store.findFirst({ where: { userId } });
  if (!store) throw new Error("Store not found");

  const updateData: any = {};
  
  if (businessName !== undefined) {
    if (businessName.trim().length === 0) throw new Error("Business name cannot be empty");
    updateData.businessName = businessName.trim();
  }
  
  if (country !== undefined) {
    if (country.trim().length === 0) throw new Error("Country cannot be empty");
    updateData.country = country;
  }
  
  if (currency !== undefined) {
    if (currency.trim().length === 0) throw new Error("Currency cannot be empty");
    updateData.currency = currency.toUpperCase();
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: updateData,
  });

  return {
    message: "Store updated successfully",
    store: {
      id: updatedStore.id,
      businessName: updatedStore.businessName,
      storeUrl: updatedStore.storeUrl,
      country: updatedStore.country,
      currency: updatedStore.currency,
      isLaunched: updatedStore.isLaunched,
    },
  };
};

export const launchStore = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const store = await prisma.store.findFirst({ where: { userId } });
  if (!store) throw new Error("Store not found");

  if (store.isLaunched) throw new Error("Store is already launched");

  const launchedStore = await prisma.store.update({
    where: { id: store.id },
    data: { isLaunched: true },
  });

  return {
    message: "Store launched successfully",
    store: {
      id: launchedStore.id,
      businessName: launchedStore.businessName,
      storeUrl: launchedStore.storeUrl,
      country: launchedStore.country,
      currency: launchedStore.currency,
      isLaunched: launchedStore.isLaunched,
    },
  };
};
