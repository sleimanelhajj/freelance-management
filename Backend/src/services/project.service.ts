// Backend/src/services/client.service.ts
import { ProjectStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";

type CreateProjectInput = {
  clientId: string;
  title: string;
  description?: string;
  deadline?: Date;
  budget?: number;
  status?: ProjectStatus;
};

type UpdateProjectInput = Partial<CreateProjectInput>;

export const projectService = {
  async getProjects(userId: string) {
    const projects = await prisma.project.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        status: true,
        deadline: true,
        budget: true,
        client: { select: { id: true, name: true } },
      },
    });
    return projects;
  },

  async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        deadline: true,
        budget: true,
        client: { select: { id: true, name: true } },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        invoices: {
          select: { id: true, invoiceNumber: true, total: true, status: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!project) {
      throw { statusCod: 404, message: "Project not found" };
    }
    return project;
  },
  async createProject(userId: string, input: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        userId,
        clientId: input.clientId,
        title: input.title,
        description: input.description,
        deadline: input.deadline,
        budget: input.budget,
        status: input.status ?? ProjectStatus.ACTIVE,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        deadline: true,
        budget: true,
        clientId: true,
      },
    });

    return project;
  },
  async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput,
  ) {
    const existingProject = await prisma.project.findFirst({
      where: { id: projectId, userId: userId },
      select: { id: true },
    });
    if (!existingProject) {
      throw { statusCode: 404, message: "Project not found" };
    }
    const data: Prisma.ProjectUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.deadline !== undefined) data.deadline = input.deadline;
    if (input.budget !== undefined) data.budget = input.budget;
    if (input.status !== undefined) data.status = input.status;

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        deadline: true,
        budget: true,
        clientId: true,
      },
    });

    return project;
  },
  async deleteProject(userId: string, projectId: string) {
    const existing = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Project not found" };
    }

    await prisma.project.delete({ where: { id: projectId } });

    return { message: "Project deleted" };
  },
};
