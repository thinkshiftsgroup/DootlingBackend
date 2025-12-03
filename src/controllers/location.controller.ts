import { Request, Response } from "express";
import { LocationService } from "src/services/location.service";
import {
  CreateLocationPayload,
  UpdateLocationPayload,
} from "src/types/location.types";

const locationService = new LocationService();

export class LocationController {
  async createLocation(req: Request, res: Response) {
    try {
      const data: CreateLocationPayload = req.body;
      const newLocation = await locationService.createLocation(data);
      res.status(201).json(newLocation);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to create location" });
    }
  }

  async getLocationById(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.id, 10);
      const storeId = req.store!.id;
      const location = await locationService.fetchLocationById(locationId, storeId);

      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  }

  async getAllLocationsByStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const locationList = await locationService.fetchAllLocationsByStore(
        storeId
      );
      res.status(200).json(locationList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location list" });
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.id, 10);
      const storeId = req.store!.id;
      const data: UpdateLocationPayload = req.body;
      const updatedLocation = await locationService.updateLocation(
        locationId,
        storeId,
        data
      );
      res.status(200).json(updatedLocation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update location" });
    }
  }

  async deleteLocation(req: Request, res: Response) {
    try {
      const locationId = parseInt(req.params.id, 10);
      const storeId = req.store!.id;
      const deletedLocation = await locationService.deleteLocation(locationId, storeId);
      res.status(200).json({
        message: "Location deleted successfully",
        location: deletedLocation,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete location" });
    }
  }
}
