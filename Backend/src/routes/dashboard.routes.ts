import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Aggregated summary for home screen
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, dashboardController.getDashboard);

export default router;
