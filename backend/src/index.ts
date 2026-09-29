import { createServer } from "node:http";
import { createApp } from "./app.js";
import { DeviceStore } from "./services/deviceStore.js";
import { AlertStore } from "./services/alertStore.js";
import { DeviceSimulator } from "./simulator/engine.js";
import { generateInitialDevices } from "./simulator/deviceFactory.js";
import { attachSocketServer } from "./socket/socketServer.js";

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:5173";
const DEVICE_COUNT = Number(process.env.DEVICE_COUNT ?? 100);
const TICK_INTERVAL_MS = Number(process.env.TICK_INTERVAL_MS ?? 1500);

const deviceStore = new DeviceStore();
const alertStore = new AlertStore();
deviceStore.seed(generateInitialDevices(DEVICE_COUNT));

const simulator = new DeviceSimulator(deviceStore, alertStore, TICK_INTERVAL_MS);

const app = createApp(deviceStore, alertStore, simulator, CORS_ORIGIN);
const httpServer = createServer(app);
attachSocketServer(httpServer, deviceStore, alertStore, simulator, CORS_ORIGIN);

simulator.start();

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`IoT backend listening on :${PORT} (${DEVICE_COUNT} devices, tick=${TICK_INTERVAL_MS}ms)`);
});

process.on("SIGTERM", () => {
  simulator.stop();
  httpServer.close(() => process.exit(0));
});
