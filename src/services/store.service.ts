import { prisma } from "../prisma";

const validateStoreUrl = (url: string): boolean => {
  const urlRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return urlRegex.test(url) && url.length >= 3 && url.length <= 63;
};

interface SetupStoreData {
  storeName?: string;
  businessName?: string;
  storeUrl: string;
  logoUrl?: string;
  businessSector?: string;
  tagLine?: string;
  description?: string;
  timezone?: string;
  currency?: string;
  phone?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

export const setupStore = async (userId: number, data: SetupStoreData) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  // Check if user already has a store
  const existingUserStore = await prisma.store.findFirst({ where: { userId } });
  if (existingUserStore) throw new Error("User already has a store");

  // Validate store URL format
  if (!validateStoreUrl(data.storeUrl)) {
    throw new Error("Invalid store URL. Must be 3-63 characters, lowercase alphanumeric and hyphens only");
  }

  // Check if store URL is unique
  const existingStore = await prisma.store.findUnique({ where: { storeUrl: data.storeUrl } });
  if (existingStore) throw new Error("Store URL already taken");

  const store = await prisma.store.create({
    data: {
      userId,
      storeName: data.storeName?.trim() || null,
      businessName: data.businessName?.trim() || null,
      storeUrl: data.storeUrl.toLowerCase(),
      logoUrl: data.logoUrl || null,
      businessSector: data.businessSector || null,
      tagLine: data.tagLine || null,
      description: data.description || null,
      timezone: data.timezone || null,
      currency: data.currency?.toUpperCase() || "USD",
      phone: data.phone || null,
      address: data.address || null,
      country: data.country || null,
      state: data.state || null,
      city: data.city || null,
      zipCode: data.zipCode || null,
    },
  });

  return {
    message: "Store setup successful",
    store: {
      id: store.id,
      storeName: store.storeName,
      businessName: store.businessName,
      storeUrl: store.storeUrl,
      logoUrl: store.logoUrl,
      businessSector: store.businessSector,
      tagLine: store.tagLine,
      description: store.description,
      timezone: store.timezone,
      currency: store.currency,
      phone: store.phone,
      address: store.address,
      country: store.country,
      state: store.state,
      city: store.city,
      zipCode: store.zipCode,
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
      storeName: store.storeName,
      businessName: store.businessName,
      storeUrl: store.storeUrl,
      logoUrl: store.logoUrl,
      businessSector: store.businessSector,
      tagLine: store.tagLine,
      description: store.description,
      timezone: store.timezone,
      currency: store.currency,
      phone: store.phone,
      address: store.address,
      country: store.country,
      state: store.state,
      city: store.city,
      zipCode: store.zipCode,
      isLaunched: store.isLaunched,
      createdAt: store.createdAt,
    },
  };
};

interface UpdateStoreData {
  storeName?: string;
  businessName?: string;
  logoUrl?: string;
  businessSector?: string;
  tagLine?: string;
  description?: string;
  timezone?: string;
  currency?: string;
  phone?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

export const updateStore = async (userId: number, data: UpdateStoreData) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const store = await prisma.store.findFirst({ where: { userId } });
  if (!store) throw new Error("Store not found");

  const updateData: any = {};
  
  if (data.storeName !== undefined) {
    updateData.storeName = data.storeName?.trim() || null;
  }
  
  if (data.businessName !== undefined) {
    updateData.businessName = data.businessName?.trim() || null;
  }
  
  if (data.logoUrl !== undefined) {
    updateData.logoUrl = data.logoUrl || null;
  }
  
  if (data.businessSector !== undefined) {
    updateData.businessSector = data.businessSector || null;
  }
  
  if (data.tagLine !== undefined) {
    updateData.tagLine = data.tagLine || null;
  }
  
  if (data.description !== undefined) {
    updateData.description = data.description || null;
  }
  
  if (data.timezone !== undefined) {
    updateData.timezone = data.timezone || null;
  }
  
  if (data.currency !== undefined) {
    updateData.currency = data.currency?.toUpperCase() || "USD";
  }
  
  if (data.phone !== undefined) {
    updateData.phone = data.phone || null;
  }
  
  if (data.address !== undefined) {
    updateData.address = data.address || null;
  }
  
  if (data.country !== undefined) {
    updateData.country = data.country || null;
  }
  
  if (data.state !== undefined) {
    updateData.state = data.state || null;
  }
  
  if (data.city !== undefined) {
    updateData.city = data.city || null;
  }
  
  if (data.zipCode !== undefined) {
    updateData.zipCode = data.zipCode || null;
  }

  const updatedStore = await prisma.store.update({
    where: { id: store.id },
    data: updateData,
  });

  return {
    message: "Store updated successfully",
    store: {
      id: updatedStore.id,
      storeName: updatedStore.storeName,
      businessName: updatedStore.businessName,
      storeUrl: updatedStore.storeUrl,
      logoUrl: updatedStore.logoUrl,
      businessSector: updatedStore.businessSector,
      tagLine: updatedStore.tagLine,
      description: updatedStore.description,
      timezone: updatedStore.timezone,
      currency: updatedStore.currency,
      phone: updatedStore.phone,
      address: updatedStore.address,
      country: updatedStore.country,
      state: updatedStore.state,
      city: updatedStore.city,
      zipCode: updatedStore.zipCode,
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
      storeName: launchedStore.storeName,
      businessName: launchedStore.businessName,
      storeUrl: launchedStore.storeUrl,
      logoUrl: launchedStore.logoUrl,
      businessSector: launchedStore.businessSector,
      tagLine: launchedStore.tagLine,
      description: launchedStore.description,
      timezone: launchedStore.timezone,
      currency: launchedStore.currency,
      phone: launchedStore.phone,
      address: launchedStore.address,
      country: launchedStore.country,
      state: launchedStore.state,
      city: launchedStore.city,
      zipCode: launchedStore.zipCode,
      isLaunched: launchedStore.isLaunched,
    },
  };
};

export const getStorefrontByUrl = async (storeUrl: string) => {
  const store = await prisma.store.findUnique({
    where: { storeUrl: storeUrl.toLowerCase() },
  });

  if (!store) throw new Error("Store not found");
  if (!store.isLaunched) throw new Error("Store is not launched yet");

  // Fetch all related data
  const [products, categories, brands, shipping, shippingMethods, settings, locations] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: store.id, hideFromHomepage: false },
      include: {
        pricings: true,
        categories: { include: { category: true } },
        descriptionDetails: true,
        options: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { storeId: store.id },
      include: {
        products: {
          include: {
            product: {
              include: {
                pricings: true,
              },
            },
          },
        },
      },
    }),
    prisma.brand.findMany({
      where: { storeId: store.id },
    }),
    prisma.shipping.findUnique({
      where: { storeId: store.id },
    }).catch(() => null),
    prisma.shippingMethod.findMany({
      where: { storeId: store.id },
    }).catch(() => []),
    prisma.generalSettings.findUnique({
      where: { storeId: store.id },
    }).catch(() => null),
    prisma.location.findMany({
      where: { storeId: store.id, isPrimary: true },
    }).catch(() => []),
  ]);

  return {
    store: {
      id: store.id,
      storeName: store.storeName,
      businessName: store.businessName,
      storeUrl: store.storeUrl,
      logoUrl: store.logoUrl,
      businessSector: store.businessSector,
      tagLine: store.tagLine,
      description: store.description,
      timezone: store.timezone,
      currency: store.currency,
      phone: store.phone,
      address: store.address,
      country: store.country,
      state: store.state,
      city: store.city,
      zipCode: store.zipCode,
      isLaunched: store.isLaunched,
      products,
      categories,
      brands,
      shipping,
      shippingMethods,
      settings,
      primaryLocation: locations[0] || null,
    },
  };
};
