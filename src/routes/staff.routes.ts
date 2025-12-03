import { Router } from "express";
import { Request, Response } from "express";
import { StaffController } from "@controllers/staff.controller";
import { protect } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import asyncHandler from "@utils/asyncHandler";

const router = Router();

router.use(protect);
const staffController = new StaffController();

router.post("/store/:storeId", verifyStoreAccess, (req, res) => staffController.createStaff(req, res));

router.get("/store/:storeId", verifyStoreAccess, (req, res) =>
  staffController.getAllStaffByStore(req, res)
);

router.get(
  "/:id",
  verifyResourceOwnership("staff"),
  asyncHandler(async (req: Request, res: Response) => {
    await staffController.getStaffById(req, res);
  })
);

router.put("/:id", verifyResourceOwnership("staff"), (req, res) => staffController.updateStaff(req, res));

router.delete("/:id", verifyResourceOwnership("staff"), (req, res) => staffController.deleteStaff(req, res));

export const staffRouter = router;
