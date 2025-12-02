import { Staff, StaffPermission } from "@prisma/client";

export interface CreateStaffPayload {
  storeId: number;
  staffRole: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  assignedLocations: string[];
  permissions: {
    viewProduct: boolean;
    manageProduct: boolean;
    deleteProduct: boolean;
    viewCostPrice: boolean;
    manageCostPrice: boolean;
  };
}

export interface UpdateStaffPayload {
  staffRole?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  assignedLocations?: string[];
  permissions?: {
    viewProduct?: boolean;
    manageProduct?: boolean;
    deleteProduct?: boolean;
    viewCostPrice?: boolean;
    manageCostPrice?: boolean;
  };
}

export type StaffWithPermissions = Staff & {
  permissions: StaffPermission | null;
};
