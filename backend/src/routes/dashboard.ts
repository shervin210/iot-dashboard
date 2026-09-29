import { Router } from "express";
import type { DeviceStore } from "../services/deviceStore.js";
import { computeSummary } from "../services/dashboardService.js";

export function createDashboardRouter(deviceStore: DeviceStore): Router {
  const router = Router();

  router.get("/summary", (_req, res) => {
    res.json({ data: computeSummary(deviceStore) });
  });

  return router;
}
