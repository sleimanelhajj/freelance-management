import {
  InvoiceStatus,
  PaymentMethod,
  Prisma,
} from "@prisma/client";
import { prisma } from "../config/db";

type LineItemInput = {
  description: string;
  qty: number;
  unitPrice: number;
};

type CreateInvoiceInput = {
  projectId: string;
  dueDate?: Date | string;
  tax?: number;
  amountPaid?: number;
  paymentMethod?: PaymentMethod;
  paidAt?: Date | string;
  lineItems: LineItemInput[];
  status?: InvoiceStatus;
};

type UpdateInvoiceInput = Partial<CreateInvoiceInput>;

const mapLineItems = (lineItems: LineItemInput[]) => {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw { statusCode: 400, message: "At least one line item is required" };
  }

  return lineItems.map((item) => {
    const description = item.description?.trim();
    const quantity = Number(item.qty);
    const unitPrice = Number(item.unitPrice);

    if (!description) {
      throw { statusCode: 400, message: "Line item description is required" };
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw { statusCode: 400, message: "Line item qty must be greater than 0" };
    }
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw { statusCode: 400, message: "Line item unitPrice must be 0 or more" };
    }

    return {
      description,
      quantity,
      unitPrice,
      total: quantity * unitPrice,
    };
  });
};

const toDate = (value?: Date | string): Date | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw { statusCode: 400, message: "Invalid date value" };
  }
  return date;
};

const makeInvoiceNumber = () => `INV-${Date.now()}`;

export const invoiceService = {
  async getInvoices(
    userId: string,
    status?: InvoiceStatus,
    projectId?: string,
  ) {
    const where: Prisma.InvoiceWhereInput = {
      project: { is: { userId } },
    };

    if (status) {
      where.status = status;
    }
    if (projectId) {
      where.projectId = projectId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
        total: true,
        amountPaid: true,
        project: {
          select: {
            id: true,
            title: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    const totalUnpaid = invoices.reduce(
      (sum, invoice) => sum + Math.max(invoice.total - invoice.amountPaid, 0),
      0,
    );

    return {
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        status: invoice.status,
        dueDate: invoice.dueDate,
        project: { id: invoice.project.id, title: invoice.project.title },
        client: invoice.project.client,
      })),
      totalUnpaid,
    };
  },

  async getInvoiceById(userId: string, invoiceId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, project: { is: { userId } } },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
        subtotal: true,
        tax: true,
        total: true,
        amountPaid: true,
        paymentMethod: true,
        paidAt: true,
        lineItems: {
          select: {
            description: true,
            quantity: true,
            unitPrice: true,
            total: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            client: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!invoice) {
      throw { statusCode: 404, message: "Invoice not found" };
    }

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      dueDate: invoice.dueDate,
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      tax: invoice.tax,
      total: invoice.total,
      amountPaid: invoice.amountPaid,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
      project: { id: invoice.project.id, title: invoice.project.title },
      client: invoice.project.client,
    };
  },

  async createInvoice(userId: string, input: CreateInvoiceInput) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId },
      select: { id: true },
    });

    if (!project) {
      throw { statusCode: 404, message: "Project not found" };
    }

    const items = mapLineItems(input.lineItems);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = Number(input.tax ?? 0);
    const total = subtotal + tax;
    const amountPaid = Math.min(Math.max(Number(input.amountPaid ?? 0), 0), total);
    const status =
      input.status ??
      (amountPaid >= total && total > 0 ? InvoiceStatus.PAID : InvoiceStatus.DRAFT);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: makeInvoiceNumber(),
        status,
        dueDate: toDate(input.dueDate),
        subtotal,
        tax,
        total,
        amountPaid,
        paymentMethod: input.paymentMethod,
        paidAt: toDate(input.paidAt),
        projectId: input.projectId,
        lineItems: {
          create: items,
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
        total: true,
        projectId: true,
        lineItems: {
          select: { description: true, quantity: true, unitPrice: true, total: true },
        },
      },
    });

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      dueDate: invoice.dueDate,
      total: invoice.total,
      projectId: invoice.projectId,
      lineItems: invoice.lineItems.map((item) => ({
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    };
  },

  async updateInvoice(userId: string, invoiceId: string, input: UpdateInvoiceInput) {
    const existing = await prisma.invoice.findFirst({
      where: { id: invoiceId, project: { is: { userId } } },
      select: { id: true, total: true, amountPaid: true, tax: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Invoice not found" };
    }

    const data: Prisma.InvoiceUpdateInput = {};
    let nextSubtotal = undefined as number | undefined;
    let nextTax = input.tax !== undefined ? Number(input.tax) : existing.tax;

    if (input.lineItems !== undefined) {
      const items = mapLineItems(input.lineItems);
      nextSubtotal = items.reduce((sum, item) => sum + item.total, 0);
      data.subtotal = nextSubtotal;
      data.lineItems = { deleteMany: {}, create: items };
    }

    if (input.tax !== undefined) {
      data.tax = nextTax;
    }

    const nextTotal =
      nextSubtotal !== undefined ? nextSubtotal + nextTax : existing.total;

    if (nextSubtotal !== undefined || input.tax !== undefined) {
      data.total = nextTotal;
    }

    if (input.dueDate !== undefined) {
      data.dueDate = input.dueDate ? toDate(input.dueDate) : null;
    }
    if (input.paymentMethod !== undefined) {
      data.paymentMethod = input.paymentMethod;
    }
    if (input.paidAt !== undefined) {
      data.paidAt = input.paidAt ? toDate(input.paidAt) : null;
    }

    if (input.amountPaid !== undefined) {
      const amountPaid = Math.min(Math.max(Number(input.amountPaid), 0), nextTotal);
      data.amountPaid = amountPaid;
      if (amountPaid >= nextTotal && nextTotal > 0) {
        data.status = InvoiceStatus.PAID;
      }
    }

    if (input.status !== undefined) {
      data.status = input.status;
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data,
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        dueDate: true,
        subtotal: true,
        tax: true,
        total: true,
        amountPaid: true,
        paymentMethod: true,
        paidAt: true,
      },
    });

    return invoice;
  },

  async deleteInvoice(userId: string, invoiceId: string) {
    const existing = await prisma.invoice.findFirst({
      where: { id: invoiceId, project: { is: { userId } } },
      select: { id: true, status: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Invoice not found" };
    }
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw { statusCode: 400, message: "Only draft invoices can be deleted" };
    }

    await prisma.invoice.delete({ where: { id: invoiceId } });
    return { message: "Invoice deleted" };
  },
};
