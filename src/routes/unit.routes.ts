import { Router } from "express";
import {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
  exportUnitsCSV,
} from "@controllers/unit.controller";
import { protect } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";

const router = Router();

// All routes require authentication
router.use(protect);

// Unit routes
router.post("/stores/:storeId/units", verifyStoreAccess, createUnit);
router.get("/stores/:storeId/units/export", verifyStoreAccess, exportUnitsCSV);
router.get("/units/:id", verifyResourceOwnership("unit"), getUnitById);
router.get("/stores/:storeId/units", verifyStoreAccess, getUnits);
router.put("/units/:id", verifyResourceOwnership("unit"), updateUnit);
router.delete("/units/:id", verifyResourceOwnership("unit"), deleteUnit);

export default router;