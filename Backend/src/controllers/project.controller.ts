import { NextFunction, Response } from "express";
import { projectService } from "../services/project.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const projectController = {
  async getProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const projects = await projectService.getProjects(userId!);
      res.status(200).json({
        success: true,
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { userId, projectId } = {
        userId: req.userId!,
        projectId: req.params.id,
      };
      const project = await projectService.getProjectById(
        userId,
        projectId as string,
      );
      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error) {
      next(error);
    }
  },
  async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const dataInput = req.body;
      const project = await projectService.createProject(userId, dataInput);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },
  async updateProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const projectId = req.params.id;
      const input = req.body;
      const project = await projectService.updateProject(
        userId,
        projectId as string,
        input,
      );
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const projectId = req.params.id;
      await projectService.deleteProject(userId, projectId as string);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
