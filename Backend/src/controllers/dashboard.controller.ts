import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { dashboardService } from "../services/dashboard.service";

export const dashboardController = {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const data = await dashboardService.getDashboard(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
