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

const router = Router();

router.post("/stores/:storeId/customers", createCustomer);
router.get("/stores/:storeId/customers", getCustomers);
router.get("/stores/:storeId/customers/stats", getCustomerStats);
router.get("/stores/:storeId/customers/export", exportCustomersCSV);
router.get("/customers/:id", getCustomerById);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

export { router as customerRouter };
