import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.routes";

// initialize express app
const API: string = "/api";
const app: Application = express();

// initialize middlewares
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// define routes
app.use(`${API}/auth`, authRoutes);

//health check
app.get("/health", (_, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

// catch-all route for undefined endpoints
app.use((_, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
