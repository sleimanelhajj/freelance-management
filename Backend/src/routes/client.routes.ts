// Backend/src/routes/client.routes.ts
import { Router } from "express";
import { clientController } from "../controllers/client.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags:
 *       - Clients
 *     summary: List all clients
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, clientController.getClients);

/**
 * @swagger
 * /api/clients/{id}:
 *   get:
 *     tags:
 *       - Clients
 *     summary: Get one client with related projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client retrieved successfully
 *       404:
 *         description: Client not found
 */
router.get("/:id", authMiddleware, clientController.getClientById);

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags:
 *       - Clients
 *     summary: Create a new client
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 example: ACME Corp
 *               email:
 *                 type: string
 *                 format: email
 *                 example: client@acme.com
 *               phone:
 *                 type: string
 *                 nullable: true
 *               company:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       201:
 *         description: Client created successfully
 *       400:
 *         description: Validation failed
 */
router.post("/", authMiddleware, clientController.createClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   patch:
 *     tags:
 *       - Clients
 *     summary: Update client info
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 nullable: true
 *               company:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 */
router.patch("/:id", authMiddleware, clientController.updateClient);

/**
 * @swagger
 * /api/clients/{id}:
 *   delete:
 *     tags:
 *       - Clients
 *     summary: Delete a client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 */
router.delete("/:id", authMiddleware, clientController.deleteClient);

export default router;
