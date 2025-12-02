import { Router } from "express";
import { Request, Response } from "express";
import { StaffController } from "@controllers/staff.controller";
import { protect } from "@middlewares/auth.middleware";
import asyncHandler from "@utils/asyncHandler";

const router = Router();

router.use(protect);
const staffController = new StaffController();

router.post("/", (req, res) => staffController.createStaff(req, res));

router.get("/store/:storeId", (req, res) =>
  staffController.getAllStaffByStore(req, res)
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await staffController.getStaffById(req, res);
  })
);

router.put("/:id", (req, res) => staffController.updateStaff(req, res));

router.delete("/:id", (req, res) => staffController.deleteStaff(req, res));

export const staffRouter = router;
