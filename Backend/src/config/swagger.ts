import swaggerJSDoc, { Options } from "swagger-jsdoc";
import { env } from "./env";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Freelance Management API",
      version: "1.0.0",
      description: "API documentation for authentication and core resources.",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/**/*.ts", "./dist/routes/**/*.js"],
};

export const swaggerSpec = swaggerJSDoc(options);
