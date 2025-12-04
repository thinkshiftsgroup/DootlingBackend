import { Router } from "express";
import {
  createProductController,
  updateProductController,
  listProductsController,
  deleteProductController,
  validateProductUrlController,
  getProductByIdController,
} from "@controllers/product.controller";
import { protect } from "@middlewares/auth.middleware";
import {
  verifyStoreAccess,
  verifyResourceOwnership,
} from "@middlewares/tenant.middleware";

const router = Router();
router.use(protect);

router.post(
  "/:storeId/validate-url",
  verifyStoreAccess,
  validateProductUrlController
);
router.post("/:storeId", verifyStoreAccess, createProductController);
router.get("/:storeId", verifyStoreAccess, listProductsController);
router.get("/:storeId/:productId", verifyStoreAccess, getProductByIdController);
router.put(
  "/:productId",
  verifyResourceOwnership("product"),
  updateProductController
);
router.delete(
  "/:productId",
  verifyResourceOwnership("product"),
  deleteProductController
);

export const productRouter = router;
