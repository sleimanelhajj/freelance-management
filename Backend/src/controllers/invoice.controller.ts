import { InvoiceStatus } from "@prisma/client";
import { NextFunction, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { invoiceService } from "../services/invoice.service";

export const invoiceController = {
  async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const status = req.query.status as InvoiceStatus | undefined;
      const projectId = req.query.projectId as string | undefined;
      const invoices = await invoiceService.getInvoices(userId, status, projectId);
      res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  },

  async getInvoiceById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, invoiceId } = {
        userId: req.userId!,
        invoiceId: req.params.id as string,
      };
      const invoice = await invoiceService.getInvoiceById(userId, invoiceId);
      res.status(200).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async createInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const input = req.body;
      const invoice = await invoiceService.createInvoice(userId, input);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async updateInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, invoiceId } = {
        userId: req.userId!,
        invoiceId: req.params.id as string,
      };
      const input = req.body;
      const invoice = await invoiceService.updateInvoice(userId, invoiceId, input);
      res.status(200).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  },

  async deleteInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, invoiceId } = {
        userId: req.userId!,
        invoiceId: req.params.id as string,
      };
      const result = await invoiceService.deleteInvoice(userId, invoiceId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};
