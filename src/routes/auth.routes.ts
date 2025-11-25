import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import asyncHandler from "../utils/asyncHandler";

const router = Router();

export const authRouter = router;
