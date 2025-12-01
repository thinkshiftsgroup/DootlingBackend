import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma";

/**
 * Middleware to verify store ownership and attach store to request
 * Ensures multi-tenant data isolation
 */
export const verifyStoreAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const storeId = parseInt(req.params.storeId);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!storeId || isNaN(storeId)) {
      res.status(400).json({ success: false, message: "Valid store ID required" });
      return;
    }

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: userId,
      },
    });

    if (!store) {
      res.status(403).json({
        success: false,
        message: "Access denied. Store not found or you don't have permission.",
      });
      return;
    }

    // Attach store to request for downstream use
    req.store = store;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error verifying store access" });
  }
};

/**
 * Middleware to verify resource belongs to user's store
 * Used for products, categories, customers, etc.
 */
export const verifyResourceOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = parseInt(req.params.id || req.params[`${resourceType}Id`]);
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: "Authentication required" });
        return;
      }

      if (!resourceId || isNaN(resourceId)) {
        res.status(400).json({ success: false, message: `Valid ${resourceType} ID required` });
        return;
      }

      // Get user's store
      const userStore = await prisma.store.findFirst({
        where: { userId },
      });

      if (!userStore) {
        res.status(404).json({ success: false, message: "Store not found" });
        return;
      }

      // Verify resource belongs to user's store
      let resource: any;
      switch (resourceType) {
        case "product":
          resource = await prisma.product.findFirst({
            where: { id: resourceId, storeId: userStore.id },
          });
          break;
        case "category":
          resource = await prisma.category.findFirst({
            where: { id: resourceId, storeId: userStore.id },
          });
          break;
        case "customer":
          resource = await prisma.customer.findFirst({
            where: { id: resourceId, storeId: userStore.id },
          });
          break;
        case "brand":
          resource = await prisma.brand.findFirst({
            where: { id: resourceId, storeId: userStore.id },
          });
          break;
        default:
          res.status(400).json({ success: false, message: "Invalid resource type" });
          return;
      }

      if (!resource) {
        res.status(403).json({
          success: false,
          message: `Access denied. ${resourceType} not found or doesn't belong to your store.`,
        });
        return;
      }

      req.store = userStore;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: "Error verifying resource ownership" });
    }
  };
};

/**
 * Middleware for public store access (by storeUrl)
 * Used for customer-facing endpoints
 */
export const getStoreByUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const storeUrl = req.params.storeUrl || req.query.storeUrl as string;

    if (!storeUrl) {
      res.status(400).json({ success: false, message: "Store URL required" });
      return;
    }

    const store = await prisma.store.findUnique({
      where: { storeUrl: storeUrl.toLowerCase() },
    });

    if (!store) {
      res.status(404).json({ success: false, message: "Store not found" });
      return;
    }

    req.store = store;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching store" });
  }
};
