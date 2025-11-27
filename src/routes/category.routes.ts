import { Router } from "express";
import {
  createCategoryController,
  updateCategoryController,
  listCategoriesController,
  deleteCategoryController,
} from "@controllers/category.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.post("/:storeId", createCategoryController);

router.get("/:storeId", listCategoriesController);

router.put("/:storeId/:categoryId", updateCategoryController);

router.delete("/:storeId/:categoryId", deleteCategoryController);

export const categoryRouter = router;
