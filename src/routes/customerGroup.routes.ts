import { Router } from "express";
import {
  createCustomerGroup,
  getCustomerGroups,
  getCustomerGroupById,
  updateCustomerGroup,
  deleteCustomerGroup,
  exportCustomerGroupsCSV,
} from "@controllers/customerGroup.controller";
import { protect } from "@middlewares/auth.middleware";
import { verifyStoreAccess } from "@middlewares/tenant.middleware";

const router = Router();

router.post("/stores/:storeId/customer-groups", protect, verifyStoreAccess, createCustomerGroup);
router.get("/stores/:storeId/customer-groups", protect, verifyStoreAccess, getCustomerGroups);
router.get("/stores/:storeId/customer-groups/export", protect, verifyStoreAccess, exportCustomerGroupsCSV);
router.get("/customer-groups/:id", protect, getCustomerGroupById);
router.put("/customer-groups/:id", protect, updateCustomerGroup);
router.delete("/customer-groups/:id", protect, deleteCustomerGroup);

export { router as customerGroupRouter };
