import { Location } from "@prisma/client";

export interface CreateLocationPayload {
  storeId: number;
  locationName: string;
  address: string;
  country: string;
  state: string;
  city: string;
  isPrimary: boolean;
}

export interface UpdateLocationPayload {
  locationName?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  isPrimary?: boolean;
}
