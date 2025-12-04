import { Router } from "express";
import * as storeController from "../controllers/store.controller";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";

const router = Router();

router.post("/setup", protect, uploadSingle, asyncHandler(storeController.setupStore));
router.get("/", protect, asyncHandler(storeController.getStore));
router.put("/", protect, uploadSingle, asyncHandler(storeController.updateStore));
router.post("/launch", protect, asyncHandler(storeController.launchStore));

// Public storefront endpoint (no auth required)
router.get("/storefront/:storeUrl", asyncHandler(storeController.getStorefrontByUrl));

export const storeRouter = router;
