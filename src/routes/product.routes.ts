import { Router } from "express";
import {
  createProductController,
  updateProductController,
  listProductsController,
  deleteProductController,
} from "@controllers/product.controller";
import { protect } from "@middlewares/auth.middleware";
const router = Router();
router.use(protect);

router.post("/:storeId", createProductController);

router.get("/:storeId", listProductsController);

router.put("/:productId", updateProductController);

router.delete("/:productId", deleteProductController);

export const productRouter = router;
