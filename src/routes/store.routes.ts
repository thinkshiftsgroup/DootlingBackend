import { Router } from "express";
import * as storeController from "../controllers/store.controller";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/setup", protect, asyncHandler(storeController.setupStore));
router.get("/", protect, asyncHandler(storeController.getStore));
router.put("/", protect, asyncHandler(storeController.updateStore));
router.post("/launch", protect, asyncHandler(storeController.launchStore));

export const storeRouter = router;
