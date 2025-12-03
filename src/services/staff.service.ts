import { PrismaClient, Staff } from "@prisma/client";

import {
  CreateStaffPayload,
  UpdateStaffPayload,
  StaffWithPermissions,
} from "src/types/staff.types";
const prisma = new PrismaClient();

export class StaffService {
  async addStaff(data: CreateStaffPayload): Promise<StaffWithPermissions> {
    const { permissions, ...staffData } = data;

    const newStaff = await prisma.staff.create({
      data: {
        ...staffData,
        permissions: {
          create: permissions,
        },
      },
      include: {
        permissions: true,
      },
    });

    return newStaff;
  }

  async fetchStaffById(staffId: number, storeId: number): Promise<StaffWithPermissions | null> {
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, storeId },
      include: { permissions: true },
    });
    return staff;
  }

  async fetchAllStaffByStore(storeId: number): Promise<StaffWithPermissions[]> {
    const staffList = await prisma.staff.findMany({
      where: { storeId: storeId },
      include: { permissions: true },
      orderBy: { lastname: "asc" },
    });
    return staffList;
  }

  async updateStaff(
    staffId: number,
    storeId: number,
    data: UpdateStaffPayload
  ): Promise<StaffWithPermissions> {
    // Verify ownership first
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, storeId }
    });
    if (!staff) throw new Error("Staff not found or access denied");

    const { permissions, ...staffData } = data;

    const updatedStaff = await prisma.staff.update({
      where: { id: staffId },
      data: {
        ...staffData,
        permissions: permissions
          ? {
              update: permissions,
            }
          : undefined,
      },
      include: {
        permissions: true,
      },
    });

    return updatedStaff;
  }

  async deleteStaff(staffId: number, storeId: number): Promise<Staff> {
    // Verify ownership first
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, storeId }
    });
    if (!staff) throw new Error("Staff not found or access denied");

    const deletedStaff = await prisma.staff.delete({
      where: { id: staffId },
    });
    return deletedStaff;
  }
}
