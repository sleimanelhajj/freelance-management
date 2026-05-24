import express, { Application } from "express";
import cors from "cors";
import { errorMiddleware } from "./middleware/error.middleware";

import helmet from "helmet";
import morgan from "morgan";
import { env } from "process";

// initialize express app
const app: Application = express();

// at the bottom, after your 404 handler
app.use(errorMiddleware);
// initialize middlewares
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// define routes

const API: string = "/api";

//health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

// catch-all route for undefined endpoints
app.use((_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// app.use(errorMiddleware);
export default app;
