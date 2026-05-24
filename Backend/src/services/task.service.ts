import { TaskStatus, Priority, Prisma } from "@prisma/client";
import { prisma } from "../config/db";

type CreateTaskInput = {
  projectId: string;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: Date;
};

type UpdateTaskInput = Partial<Omit<CreateTaskInput, "projectId">> & {
  status?: TaskStatus;
};

export const taskService = {
  async getTasks(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      select: { id: true },
    });
    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
      },
    });

    return tasks;
  },

  async createTask(userId: string, input: CreateTaskInput) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId },
      select: { id: true },
    });

    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    const task = await prisma.task.create({
      data: {
        projectId: input.projectId,
        title: input.title,
        description: input.description,
        priority: input.priority ?? Priority.MEDIUM,
        dueDate: input.dueDate,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
      },
    });

    return task;
  },
  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, project: { userId } },
      select: { id: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Task not found" };
    }

    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.dueDate !== undefined) data.dueDate = input.dueDate;

    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
      },
    });

    return task;
  },

  async deleteTask(userId: string, taskId: string) {
    const existing = await prisma.task.findFirst({
      where: { id: taskId, project: { userId } },
      select: { id: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Task not found" };
    }

    await prisma.task.delete({ where: { id: taskId } });

    return { message: "Task deleted" };
  },
};
