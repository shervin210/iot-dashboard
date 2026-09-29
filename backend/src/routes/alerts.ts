import { Router } from "express";
import type { AlertStore } from "../services/alertStore.js";

export function createAlertsRouter(alertStore: AlertStore): Router {
  const router = Router();

  router.get("/", (req, res) => {
    const includeResolved = req.query.includeResolved === "true";
    res.json({
      data: {
        active: alertStore.getActive(),
        resolved: includeResolved ? alertStore.getResolved() : []
      }
    });
  });

  router.post("/:id/resolve", (req, res) => {
    const alert = alertStore.resolveById(req.params.id);
    if (!alert) {
      res.status(404).json({ error: "Active alert not found" });
      return;
    }
    res.json({ data: alert });
  });

  return router;
}
