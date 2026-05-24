import { InvoiceStatus, ProjectStatus } from "@prisma/client";
import { prisma } from "../config/db";

export const dashboardService = {
  async getDashboard(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      activeProjects,
      totalClients,
      invoices,
      overdueInvoices,
      earnedThisMonthRaw,
      upcomingDeadlinesRaw,
      recentProjects,
      recentTasks,
      recentInvoices,
    ] = await Promise.all([
      prisma.project.count({
        where: { userId, status: ProjectStatus.ACTIVE },
      }),
      prisma.client.count({
        where: { userId },
      }),
      prisma.invoice.findMany({
        where: { project: { is: { userId } } },
        select: { status: true, total: true, amountPaid: true },
      }),
      prisma.invoice.count({
        where: {
          project: { is: { userId } },
          status: { not: InvoiceStatus.PAID },
          dueDate: { lt: now },
        },
      }),
      prisma.invoice.aggregate({
        where: {
          project: { is: { userId } },
          paidAt: { gte: startOfMonth, lte: now },
        },
        _sum: { amountPaid: true },
      }),
      prisma.project.findMany({
        where: {
          userId,
          deadline: { gte: now },
          status: { not: ProjectStatus.COMPLETED },
        },
        orderBy: { deadline: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          deadline: true,
          client: { select: { name: true } },
        },
      }),
      prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { title: true, createdAt: true },
      }),
      prisma.task.findMany({
        where: { project: { userId } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { title: true, createdAt: true },
      }),
      prisma.invoice.findMany({
        where: { project: { is: { userId } } },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { invoiceNumber: true, createdAt: true },
      }),
    ]);

    const unpaidInvoices = invoices.filter(
      (invoice) => invoice.status !== InvoiceStatus.PAID,
    ).length;
    const totalUnpaid = invoices.reduce(
      (sum, invoice) => sum + Math.max(invoice.total - invoice.amountPaid, 0),
      0,
    );
    const earnedThisMonth = earnedThisMonthRaw._sum.amountPaid ?? 0;

    const upcomingDeadlines = upcomingDeadlinesRaw.map((project) => ({
      projectId: project.id,
      title: project.title,
      deadline: project.deadline,
      clientName: project.client.name,
    }));

    const recentActivity = [
      ...recentProjects.map((project) => ({
        type: "PROJECT_CREATED",
        description: `Project created: ${project.title}`,
        createdAt: project.createdAt,
      })),
      ...recentTasks.map((task) => ({
        type: "TASK_CREATED",
        description: `Task created: ${task.title}`,
        createdAt: task.createdAt,
      })),
      ...recentInvoices.map((invoice) => ({
        type: "INVOICE_CREATED",
        description: `Invoice created: ${invoice.invoiceNumber}`,
        createdAt: invoice.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 8);

    return {
      stats: {
        activeProjects,
        totalClients,
        unpaidInvoices,
        totalUnpaid,
        overdueInvoices,
        earnedThisMonth,
      },
      upcomingDeadlines,
      recentActivity,
    };
  },
};
