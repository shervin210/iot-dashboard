import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import type { DeviceStore } from "./services/deviceStore.js";
import type { AlertStore } from "./services/alertStore.js";
import type { DeviceSimulator } from "./simulator/engine.js";
import { createDeviceRouter } from "./routes/devices.js";
import { createDashboardRouter } from "./routes/dashboard.js";
import { createAlertsRouter } from "./routes/alerts.js";

export function createApp(
  deviceStore: DeviceStore,
  alertStore: AlertStore,
  simulator: DeviceSimulator,
  corsOrigin: string
): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json());
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/health", (_req, res) => res.json({ status: "ok", uptime: process.uptime() }));

  app.use("/api/devices", createDeviceRouter(deviceStore, simulator));
  app.use("/api/dashboard", createDashboardRouter(deviceStore));
  app.use("/api/alerts", createAlertsRouter(alertStore));

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
