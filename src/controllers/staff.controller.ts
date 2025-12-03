import { Request, Response } from "express";
import { StaffService } from "@services/staff.service";
import { CreateStaffPayload, UpdateStaffPayload } from "src/types/staff.types";

const staffService = new StaffService();

export class StaffController {
  async createStaff(req: Request, res: Response) {
    try {
      const data: CreateStaffPayload = req.body;
      const newStaff = await staffService.addStaff(data);
      res.status(201).json({
        message: "Staff member created successfully",
        data: newStaff,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create staff member" });
    }
  }

  async getStaffById(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id, 10);
      const staff = await staffService.fetchStaffById(staffId);

      if (!staff) {
        return res.status(404).json({ message: "Staff not found" });
      }
      res.status(200).json({
        message: "Staff member fetched successfully",
        data: staff,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff member" });
    }
  }

  async getAllStaffByStore(req: Request, res: Response) {
    try {
      const storeId = parseInt(req.params.storeId, 10);
      const staffList = await staffService.fetchAllStaffByStore(storeId);
      res.status(200).json({
        message: "Staff list fetched successfully",
        data: staffList,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff list" });
    }
  }

  async updateStaff(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id, 10);
      const storeId = req.store!.id;
      const data: UpdateStaffPayload = req.body;
      const updatedStaff = await staffService.updateStaff(staffId, storeId, data);
      res.status(200).json({
        message: "Staff member updated successfully",
        data: updatedStaff,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update staff member" });
    }
  }

  async deleteStaff(req: Request, res: Response) {
    try {
      const staffId = parseInt(req.params.id, 10);
      const storeId = req.store!.id;
      const deletedStaff = await staffService.deleteStaff(staffId, storeId);
      res.status(200).json({
        message: "Staff member deleted successfully",
        data: deletedStaff,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  }
}
