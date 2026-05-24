import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const result = await authService.register(name, email, password);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json({
        success: true,
        message: "User logged in successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const user = await authService.me(userId!);
      res.status(200).json({
        success: true,
        message: "User data retrieved successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
