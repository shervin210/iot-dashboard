import { Router } from "express";
import type { DeviceStore } from "../services/deviceStore.js";
import type { DeviceSimulator } from "../simulator/engine.js";
import type { DevicePriority, DeviceStatus, SimulationEventType } from "../types/domain.js";

const VALID_EVENTS: SimulationEventType[] = [
  "urgent_alarm",
  "technical_fault",
  "power_failure",
  "disconnect",
  "reconnect",
  "resolve_alarm"
];

export function createDeviceRouter(deviceStore: DeviceStore, simulator: DeviceSimulator): Router {
  const router = Router();

  // GET /api/devices?search=&status=&priority=&page=&pageSize=&sortBy=lastSeen
  router.get("/", (req, res) => {
    const { search, status, priority, page = "1", pageSize = "25", sortBy } = req.query as Record<string, string>;

    let devices = deviceStore.getAll();

    if (search) {
      const term = search.toLowerCase();
      devices = devices.filter(
        (d) => d.name.toLowerCase().includes(term) || d.id.toLowerCase().includes(term)
      );
    }
    if (status) {
      devices = devices.filter((d) => d.status === (status as DeviceStatus));
    }
    if (priority) {
      devices = devices.filter((d) => d.priority === (priority as DevicePriority));
    }
    if (sortBy === "lastSeen") {
      devices = [...devices].sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const size = Math.min(200, Math.max(1, parseInt(pageSize, 10) || 25));
    const start = (pageNum - 1) * size;
    const paged = devices.slice(start, start + size);

    res.json({
      data: paged,
      pagination: {
        page: pageNum,
        pageSize: size,
        total: devices.length,
        totalPages: Math.max(1, Math.ceil(devices.length / size))
      }
    });
  });

  router.get("/:id", (req, res) => {
    const device = deviceStore.getById(req.params.id);
    if (!device) {
      res.status(404).json({ error: "Device not found" });
      return;
    }
    res.json({ data: device, history: deviceStore.getHistory(device.id) });
  });

  router.post("/:id/simulate", (req, res) => {
    const { eventType } = req.body as { eventType?: string };

    if (!eventType || !VALID_EVENTS.includes(eventType as SimulationEventType)) {
      res.status(400).json({ error: `eventType must be one of: ${VALID_EVENTS.join(", ")}` });
      return;
    }

    const device = deviceStore.getById(req.params.id);
    if (!device) {
      res.status(404).json({ error: "Device not found" });
      return;
    }

    const updated = simulator.applyEvent(req.params.id, eventType as SimulationEventType);
    res.json({ data: updated });
  });

  return router;
}
