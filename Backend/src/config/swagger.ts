// Backend/src/config/swagger.ts
import swaggerJSDoc, { Options } from "swagger-jsdoc";
import { env } from "./env";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Freelance Management API",
      version: "1.0.0",
      description: "API documentation for auth and client management",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Clients", description: "Client CRUD endpoints" },
      { name: "Projects", description: "Project CRUD endpoints" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ProjectSummary: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            title: { type: "string" },
            status: { type: "string", example: "ACTIVE" },
            deadline: { type: "string", format: "date-time", nullable: true },
          },
        },
        Client: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            phone: { type: "string", nullable: true },
            company: { type: "string", nullable: true },
            notes: { type: "string", nullable: true },
            status: { type: "string", example: "ACTIVE" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/**/*.ts", "./dist/routes/**/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
