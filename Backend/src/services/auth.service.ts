import { prisma } from "../config/db";
import { env } from "../config/env";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Profile } from "passport-google-oauth20";

export const authService = {
  async register(name: string, email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw { statusCode: 400, message: "User with this email already exists" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const saveUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        passwordPromptStatus: "DONE",
      },
    });

    const token = this.signToken(saveUser.id);
    const safeUser = this.toSafeUser(saveUser);
    return { user: safeUser, token };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      throw { statusCode: 401, message: "User not found, please sign up!" };
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw { statusCode: 401, message: "Invalid email or password" };
    }

    const token = this.signToken(user.id);
    const safeUser = this.toSafeUser(user);
    return { user: safeUser, token };
  },

  async loginOrRegisterWithGoogle(profile: Profile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    const name =
      profile.displayName?.trim() ||
      `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
      "Google User";

    if (!email) {
      throw { statusCode: 400, message: "Google account email is required" };
    }

    const existingByGoogle = await prisma.user.findUnique({
      where: { googleId },
    });

    if (existingByGoogle) {
      return {
        user: this.toSafeUser(existingByGoogle),
        token: this.signToken(existingByGoogle.id),
        shouldPromptSetPassword:
          existingByGoogle.passwordPromptStatus === "PENDING",
      };
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      const linkedUser = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: { googleId },
      });

      return {
        user: this.toSafeUser(linkedUser),
        token: this.signToken(linkedUser.id),
        shouldPromptSetPassword:
          linkedUser.passwordPromptStatus === "PENDING",
      };
    }

    // Password remains required in current schema, so we set a random hash for Google-created accounts.
    const randomPasswordSeed = crypto.randomBytes(32).toString("hex");
    const randomPasswordHash = await bcrypt.hash(randomPasswordSeed, 10);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        password: randomPasswordHash,
        passwordPromptStatus: "PENDING",
      },
    });

    return {
      user: this.toSafeUser(createdUser),
      token: this.signToken(createdUser.id),
      shouldPromptSetPassword: true,
    };
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

  async setPassword(userId: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, passwordPromptStatus: "DONE" },
    });
  },

  async skipPasswordPrompt(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { passwordPromptStatus: "SKIPPED" },
    });
  },

  signToken(userId: string) {
    return jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  },

  toSafeUser(user: { id: string; name: string; email: string; createdAt: Date }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};
