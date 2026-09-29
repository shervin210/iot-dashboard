import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import type { DeviceStore } from "../services/deviceStore.js";
import type { AlertStore } from "../services/alertStore.js";
import type { DeviceSimulator } from "../simulator/engine.js";
import { computeSummary } from "../services/dashboardService.js";

export function attachSocketServer(
  httpServer: HttpServer,
  deviceStore: DeviceStore,
  alertStore: AlertStore,
  simulator: DeviceSimulator,
  corsOrigin: string
): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: corsOrigin, methods: ["GET", "POST"] }
  });

  io.on("connection", (socket) => {
    // A client that just (re)connected may have missed events while
    // offline. Rather than trusting a delta, hand it a full snapshot
    // it can reconcile against — this is the authoritative resync path.
    socket.emit("sync:snapshot", {
      devices: deviceStore.getAll(),
      alerts: alertStore.getActive(),
      summary: computeSummary(deviceStore)
    });

    socket.on("disconnect", () => {
      // No per-socket state is kept, so there is nothing to clean up
      // here beyond what Socket.IO already does automatically.
    });
  });

  const broadcastSummary = () => io.emit("dashboard:summary", { summary: computeSummary(deviceStore) });

  simulator.on("device:updated", (device) => {
    io.emit("device:updated", { device });
  });
  simulator.on("device:connected", (device) => {
    io.emit("device:connected", { deviceId: device.id, status: device.status, timestamp: device.lastSeen, version: device.version });
    broadcastSummary();
  });
  simulator.on("device:disconnected", (device) => {
    io.emit("device:disconnected", { deviceId: device.id, status: device.status, timestamp: device.lastSeen, version: device.version });
    broadcastSummary();
  });
  simulator.on("alert:created", (alert) => {
    io.emit("alert:created", { alert });
    broadcastSummary();
  });
  simulator.on("alert:resolved", (alert) => {
    io.emit("alert:resolved", { alert });
    broadcastSummary();
  });

  return io;
}
