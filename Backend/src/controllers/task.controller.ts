import { NextFunction, Response } from "express";
import { taskService } from "../services/task.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const taskController = {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, projectId } = {
        userId: req.userId!,
        projectId: req.params.id as string,
      };
      const tasks = await taskService.getTasks(userId, projectId);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  },

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, input } = {
        userId: req.userId!,
        input: req.body,
      };
      const task = await taskService.createTask(userId, input);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, taskId, input } = {
        userId: req.userId!,
        taskId: req.params.id as string,
        input: req.body,
      };
      const task = await taskService.updateTask(userId, taskId, input);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  },

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, taskId } = {
        userId: req.userId!,
        taskId: req.params.id as string,
      };
      await taskService.deleteTask(userId, taskId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
