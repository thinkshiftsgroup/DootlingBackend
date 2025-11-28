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

const router = Router();

// All routes require authentication
router.use(protect);

// Unit routes
router.post("/stores/:storeId/units", createUnit);
router.get("/stores/:storeId/units/export", exportUnitsCSV);
router.get("/units/:id", getUnitById);
router.get("/stores/:storeId/units", getUnits);
router.put("/units/:id", updateUnit);
router.delete("/units/:id", deleteUnit);

export default router;