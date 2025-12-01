import { Router } from "express";
import {
  createCustomerGroup,
  getCustomerGroups,
  getCustomerGroupById,
  updateCustomerGroup,
  deleteCustomerGroup,
  exportCustomerGroupsCSV,
} from "@controllers/customerGroup.controller";

const router = Router();

router.post("/stores/:storeId/customer-groups", createCustomerGroup);
router.get("/stores/:storeId/customer-groups", getCustomerGroups);
router.get("/stores/:storeId/customer-groups/export", exportCustomerGroupsCSV);
router.get("/customer-groups/:id", getCustomerGroupById);
router.put("/customer-groups/:id", updateCustomerGroup);
router.delete("/customer-groups/:id", deleteCustomerGroup);

export { router as customerGroupRouter };
