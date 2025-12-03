import { PrismaClient, Location } from "@prisma/client";
import {
  CreateLocationPayload,
  UpdateLocationPayload,
} from "src/types/location.types";

const prisma = new PrismaClient();

export class LocationService {
  async createLocation(data: CreateLocationPayload): Promise<Location> {
    const { storeId, isPrimary } = data;

    if (isPrimary) {
      await prisma.location.updateMany({
        where: { storeId: storeId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const newLocation = await prisma.location.create({
      data: data,
    });

    return newLocation;
  }

  async fetchLocationById(locationId: number, storeId: number): Promise<Location | null> {
    const location = await prisma.location.findFirst({
      where: { id: locationId, storeId },
    });
    return location;
  }

  async fetchAllLocationsByStore(storeId: number): Promise<Location[]> {
    const locationList = await prisma.location.findMany({
      where: { storeId: storeId },
      orderBy: { isPrimary: "desc" },
    });
    return locationList;
  }

  async updateLocation(
    locationId: number,
    storeId: number,
    data: UpdateLocationPayload
  ): Promise<Location> {
    // Verify ownership first
    const location = await prisma.location.findFirst({
      where: { id: locationId, storeId }
    });
    if (!location) throw new Error("Location not found or access denied");

    const { isPrimary, ...updateData } = data;

    if (isPrimary === true) {
      await prisma.location.updateMany({
        where: { storeId: location.storeId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updatedLocation = await prisma.location.update({
      where: { id: locationId },
      data: data,
    });

    return updatedLocation;
  }

  async deleteLocation(locationId: number, storeId: number): Promise<Location> {
    // Verify ownership first
    const location = await prisma.location.findFirst({
      where: { id: locationId, storeId }
    });
    if (!location) throw new Error("Location not found or access denied");

    const deletedLocation = await prisma.location.delete({
      where: { id: locationId },
    });
    return deletedLocation;
  }
}
