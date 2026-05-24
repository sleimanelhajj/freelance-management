// Backend/src/services/client.service.ts
import { ClientStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";

type CreateClientInput = {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  status?: ClientStatus;
};

// its partially the one above
type UpdateClientInput = Partial<CreateClientInput>;

export const clientService = {
  async getClients(userId: string) {
    // fetch the clients in th DB
    const clients = await prisma.client.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        status: true,
      },
    });

    return clients;
  },

  async getClientById(userId: string, clientId: string) {
    // fetch client
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        notes: true,
        status: true,
        projects: {
          select: { id: true, title: true, status: true, deadline: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!client) {
      throw { statusCode: 404, message: "Client not found" };
    }

    return client;
  },

  async createClient(userId: string, input: CreateClientInput) {
    // create a new client
    const client = await prisma.client.create({
      data: {
        userId: userId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
        status: input.status ?? ClientStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        notes: true,
        status: true,
      },
    });
    return client;
  },

  async updateClient(
    userId: string,
    clientId: string,
    input: UpdateClientInput,
  ) {
    // update a client, check if he exists
    const existing = await prisma.client.findFirst({
      where: { id: clientId, userId: userId },
      select: { id: true },
    });

    if (!existing) {
      throw { statusCode: 404, message: "Client not found" };
    }

    // dont updaed untouched data
    const data: Prisma.ClientUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.email !== undefined) data.email = input.email;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.company !== undefined) data.company = input.company;
    if (input.notes !== undefined) data.notes = input.notes;
    if (input.status !== undefined) data.status = input.status;

    const client = await prisma.client.update({
      where: { id: clientId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        company: true,
        notes: true,
        status: true,
      },
    });

    return client;
  },

  async deleteClient(userId: string, clientId: string) {
    // check if client exists
    const existing = await prisma.client.findFirst({
      where: { id: clientId, userId: userId },
      select: { id: true },
    });
    // doesnt exist throw error
    if (!existing) {
      throw { statusCode: 404, message: "Client not found" };
    }
    // else i want to delete him
    await prisma.client.delete({ where: { id: clientId } });

    return { message: "Client deleted" };
  },
};
