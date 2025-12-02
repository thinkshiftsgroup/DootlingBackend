import { Router, Request, Response } from "express";
import { LocationController } from "src/controllers/location.controller";
import { protect } from "@middlewares/auth.middleware";
import asyncHandler from "@utils/asyncHandler";
const router = Router();
router.use(protect);
const locationController = new LocationController();

router.post("/", (req, res) => locationController.createLocation(req, res));

router.get("/store/:storeId", (req, res) =>
  locationController.getAllLocationsByStore(req, res)
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    await locationController.getLocationById(req, res);
  })
);

router.put("/:id", (req, res) => locationController.updateLocation(req, res));

router.delete("/:id", (req, res) =>
  locationController.deleteLocation(req, res)
);

export const locationRouter = router;
