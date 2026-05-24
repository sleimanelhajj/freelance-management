import { Router } from "express";
import { invoiceController } from "../controllers/invoice.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * /api/invoices:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: List all invoices
 *     description: Supports optional query params `status` and `projectId`
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [DRAFT, SENT, PAID, OVERDUE]
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", authMiddleware, invoiceController.getInvoices);

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     tags:
 *       - Invoices
 *     summary: Get single invoice with line items
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Invoice not found
 */
router.get("/:id", authMiddleware, invoiceController.getInvoiceById);

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Create invoice with line items
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
 *               - lineItems
 *             properties:
 *               projectId:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               tax:
 *                 type: number
 *               amountPaid:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [BANK_TRANSFER, CASH, PAYPAL, CARD, OTHER]
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               lineItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - description
 *                     - qty
 *                     - unitPrice
 *                   properties:
 *                     description:
 *                       type: string
 *                     qty:
 *                       type: number
 *                     unitPrice:
 *                       type: number
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       404:
 *         description: Project not found
 */
router.post("/", authMiddleware, invoiceController.createInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   patch:
 *     tags:
 *       - Invoices
 *     summary: Update invoice or mark as sent/paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice updated successfully
 *       404:
 *         description: Invoice not found
 */
router.patch("/:id", authMiddleware, invoiceController.updateInvoice);

/**
 * @swagger
 * /api/invoices/{id}:
 *   delete:
 *     tags:
 *       - Invoices
 *     summary: Delete a draft invoice
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice deleted successfully
 *       400:
 *         description: Only draft invoices can be deleted
 *       404:
 *         description: Invoice not found
 */
router.delete("/:id", authMiddleware, invoiceController.deleteInvoice);

export default router;
