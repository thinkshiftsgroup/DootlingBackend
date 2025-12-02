import { Router } from "express";
import * as customerAuthController from "@controllers/customerAuth.controller";
import asyncHandler from "@utils/asyncHandler";
import { customerProtect } from "@middlewares/customerAuth.middleware";
import { getStoreByUrl } from "@middlewares/tenant.middleware";

const router = Router();

router.post("/:storeUrl/auth/register", getStoreByUrl, asyncHandler(customerAuthController.register));
router.post("/:storeUrl/auth/verify-email", getStoreByUrl, asyncHandler(customerAuthController.verifyEmail));
router.post("/:storeUrl/auth/resend-verification", getStoreByUrl, asyncHandler(customerAuthController.resendVerificationCode));
router.post("/:storeUrl/auth/login", getStoreByUrl, asyncHandler(customerAuthController.login));
router.post("/:storeUrl/auth/refresh-token", asyncHandler(customerAuthController.refreshToken));
router.post("/:storeUrl/auth/forgot-password", getStoreByUrl, asyncHandler(customerAuthController.forgotPassword));
router.post("/:storeUrl/auth/verify-reset-code", getStoreByUrl, asyncHandler(customerAuthController.verifyResetCode));
router.post("/:storeUrl/auth/reset-password", getStoreByUrl, asyncHandler(customerAuthController.resetPassword));
router.post("/:storeUrl/auth/logout", customerProtect, asyncHandler(customerAuthController.logout));
router.put("/:storeUrl/customer/profile", getStoreByUrl, customerProtect, asyncHandler(customerAuthController.updateProfile));

export const customerAuthRouter = router;
