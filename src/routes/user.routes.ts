import { Router } from "express";
import * as userController from "../controllers/user.controller";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../middlewares/auth.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";

const router = Router();

router.get("/profile", protect, asyncHandler(userController.getProfile));
router.put("/profile", protect, asyncHandler(userController.updateProfile));
router.post("/profile/photo", protect, uploadSingle, asyncHandler(userController.uploadProfilePhoto));

export const userRouter = router;
