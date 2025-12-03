import { Router } from "express";
import {
  createCategoryController,
  updateCategoryController,
  listCategoriesController,
  deleteCategoryController,
} from "@controllers/category.controller";
import { protect } from "../middlewares/auth.middleware";
import { verifyStoreAccess } from "@middlewares/tenant.middleware";

const router = Router();

router.use(protect);

router.post("/:storeId", verifyStoreAccess, createCategoryController);
router.get("/:storeId", verifyStoreAccess, listCategoriesController);
router.put("/:storeId/:categoryId", verifyStoreAccess, updateCategoryController);
router.delete("/:storeId/:categoryId", verifyStoreAccess, deleteCategoryController);

export const categoryRouter = router;
