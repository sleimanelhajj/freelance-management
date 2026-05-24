import { Router } from "express";
import { projectController } from "../controllers/project.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, projectController.getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get a single project with tasks and invoices
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:id", authMiddleware, projectController.getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a new project
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - title
 *             properties:
 *               clientId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               budget:
 *                 type: number
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, PAUSED, CANCELLED]
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation failed
 */
router.post("/", authMiddleware, projectController.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Update project fields or status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               budget:
 *                 type: number
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, COMPLETED, PAUSED, CANCELLED]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.patch("/:id", authMiddleware, projectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete("/:id", authMiddleware, projectController.deleteProject);

export default router;
