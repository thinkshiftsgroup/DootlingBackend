import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/verify-email", asyncHandler(authController.verifyEmail));
router.post("/resend-verification", asyncHandler(authController.resendVerificationCode));
router.post("/set-password", protect, asyncHandler(authController.setPassword));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/verify-reset-code", asyncHandler(authController.verifyResetCode));
router.post("/reset-password", asyncHandler(authController.resetPassword));
router.post("/logout", protect, asyncHandler(authController.logout));

export const authRouter = router;
