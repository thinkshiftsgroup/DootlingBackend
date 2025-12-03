import { Router, Request, Response } from "express";
import { LocationController } from "src/controllers/location.controller";
import { protect } from "@middlewares/auth.middleware";
import { verifyStoreAccess, verifyResourceOwnership } from "@middlewares/tenant.middleware";
import asyncHandler from "@utils/asyncHandler";
const router = Router();
router.use(protect);
const locationController = new LocationController();

router.post("/store/:storeId", verifyStoreAccess, (req, res) => locationController.createLocation(req, res));

router.get("/store/:storeId", verifyStoreAccess, (req, res) =>
  locationController.getAllLocationsByStore(req, res)
);

router.get(
  "/:id",
  verifyResourceOwnership("location"),
  asyncHandler(async (req: Request, res: Response) => {
    await locationController.getLocationById(req, res);
  })
);

router.put("/:id", verifyResourceOwnership("location"), (req, res) => locationController.updateLocation(req, res));

router.delete("/:id", verifyResourceOwnership("location"), (req, res) =>
  locationController.deleteLocation(req, res)
);

export const locationRouter = router;
