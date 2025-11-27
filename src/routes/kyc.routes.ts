import { Router } from "express";
import * as kycController from "../controllers/kyc.controller";
import asyncHandler from "../utils/asyncHandler";
import { protect } from "../middlewares/auth.middleware";
import { uploadFields } from "../middlewares/upload.middleware";

const router = Router();

router.get("/personal", protect, asyncHandler(kycController.getPersonalKyc));
router.put("/personal", protect, asyncHandler(kycController.updatePersonalKyc));

router.get("/business", protect, asyncHandler(kycController.getBusinessKyc));
router.put("/business", protect, asyncHandler(kycController.updateBusinessKyc));

router.get("/documents", protect, asyncHandler(kycController.getDocuments));
router.put("/documents", protect, asyncHandler(kycController.saveDocuments));
router.post("/documents/upload", protect, uploadFields, asyncHandler(kycController.uploadDocuments));

router.post("/submit", protect, asyncHandler(kycController.submitKyc));

router.get("/peps", protect, asyncHandler(kycController.getPeps));
router.put("/peps", protect, asyncHandler(kycController.savePeps));

export const kycRouter = router;
