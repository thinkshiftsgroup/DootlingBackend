import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomerStats,
  exportCustomersCSV,
} from "@controllers/customer.controller";
import { protect } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";

const router = Router();

router.post("/stores/:storeId/customers", protect, verifyStoreAccess, createCustomer);
router.get("/stores/:storeId/customers", protect, verifyStoreAccess, getCustomers);
router.get("/stores/:storeId/customers/stats", protect, verifyStoreAccess, getCustomerStats);
router.get("/stores/:storeId/customers/export", protect, verifyStoreAccess, exportCustomersCSV);
router.get("/customers/:id", protect, verifyResourceOwnership("customer"), getCustomerById);
router.put("/customers/:id", protect, verifyResourceOwnership("customer"), updateCustomer);
router.delete("/customers/:id", protect, verifyResourceOwnership("customer"), deleteCustomer);

export { router as customerRouter };
