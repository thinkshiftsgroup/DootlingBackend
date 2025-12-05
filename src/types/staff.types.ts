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
    viewOrder: boolean;
    manageOrder: boolean;
    deleteOrder: boolean;
    viewTransaction: boolean;
    manageTransaction: boolean;
    viewMessaging: boolean;
    manageMessaging: boolean;
    viewExpense: boolean;
    manageExpense: boolean;
    viewPointOfSale: boolean;
    managePointOfSale: boolean;
    viewStoreCustomization: boolean;
    manageStoreCustomization: boolean;
    viewDiscountCoupon: boolean;
    manageDiscountCoupon: boolean;
    viewLocation: boolean;
    manageLocation: boolean;
    viewSettings: boolean;
    manageSettings: boolean;
    viewExportData: boolean;
    viewAnalytics: boolean;
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
    viewOrder?: boolean;
    manageOrder?: boolean;
    deleteOrder?: boolean;
    viewTransaction?: boolean;
    manageTransaction?: boolean;
    viewMessaging?: boolean;
    manageMessaging?: boolean;
    viewExpense?: boolean;
    manageExpense?: boolean;
    viewPointOfSale?: boolean;
    managePointOfSale?: boolean;
    viewStoreCustomization?: boolean;
    manageStoreCustomization?: boolean;
    viewDiscountCoupon?: boolean;
    manageDiscountCoupon?: boolean;
    viewLocation?: boolean;
    manageLocation?: boolean;
    viewSettings?: boolean;
    manageSettings?: boolean;
    viewExportData?: boolean;
    viewAnalytics?: boolean;
  };
}

export type StaffWithPermissions = Staff & {
  permissions: StaffPermission | null;
};
