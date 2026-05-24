import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/tasks/{id}/all:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks for a project
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
 *         description: Tasks retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:id/all", authMiddleware, taskController.getTasks);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - title
 *             properties:
 *               projectId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Task created successfully
 *       404:
 *         description: Project not found
 */
router.post("/", authMiddleware, taskController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
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
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.patch("/:id", authMiddleware, taskController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete("/:id", authMiddleware, taskController.deleteTask);

export default router;
