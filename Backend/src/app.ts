import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import passport from "passport";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import invoiceRoutes from "./routes/invoice.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import "./config/passport";

// initialize express app
const API: string = "/api";
const app: Application = express();
const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:4200",
  "http://localhost:3000",

  "http://127.0.0.1:4200",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// initialize middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl/postman) and approved browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// define routes
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/clients`, clientRoutes);
app.use(`${API}/projects`, projectRoutes);
app.use(`${API}/tasks`, taskRoutes);
app.use(`${API}/invoices`, invoiceRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);

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
