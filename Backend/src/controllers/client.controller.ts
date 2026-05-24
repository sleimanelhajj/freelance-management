import { NextFunction, Response } from "express";
import { clientService } from "../services/client.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const clientController = {
  async getClients(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const clients = await clientService.getClients(userId!);
      res.status(200).json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  },
  async getClientById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, clientId } = {
        userId: req.userId!,
        clientId: req.params.id,
      };
      const client = await clientService.getClientById(
        userId,
        clientId as string,
      );
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  },
  async createClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const input = req.body;
      const client = await clientService.createClient(userId, input);
      res.status(201).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  },
  async updateClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, clientId } = {
        userId: req.userId!,
        clientId: req.params.id,
      };
      const input = req.body;
      const client = await clientService.updateClient(
        userId,
        clientId as string,
        input,
      );
      res.status(200).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  },
  async deleteClient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, clientId } = {
        userId: req.userId!,
        clientId: req.params.id,
      };
      await clientService.deleteClient(userId, clientId as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
