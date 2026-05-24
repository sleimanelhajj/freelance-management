import { prisma } from "../config/db";
import { env } from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authService = {
  async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw { statusCode: 400, message: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const saveUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: saveUser.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const safeUser = {
      id: saveUser.id,
      name: saveUser.name,
      email: saveUser.email,
      createdAt: saveUser.createdAt,
    };

    return { user: safeUser, token };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    return { user: safeUser, token };
  },
  async me(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) throw { statusCode: 404, message: "User not found" };
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
    return safeUser;
  },
};
