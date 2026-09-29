import { EventEmitter } from "node:events";
import type { Device, SimulationEventType } from "../types/domain.js";
import type { DeviceStore } from "../services/deviceStore.js";
import type { AlertStore } from "../services/alertStore.js";
import { chance, drift, randomInt } from "../utils/random.js";

export interface SimulatorEvents {
  "device:updated": [Device];
  "device:connected": [Device];
  "device:disconnected": [Device];
  "alert:created": [ReturnType<AlertStore["create"]>];
  "alert:resolved": [ReturnType<AlertStore["create"]>];
}

const EVENT_MESSAGES: Record<SimulationEventType, string> = {
  urgent_alarm: "Fire alarm activated",
  technical_fault: "Technical fault detected on panel",
  power_failure: "AC power lost, running on battery",
  disconnect: "Gateway disconnected",
  reconnect: "Gateway reconnected",
  resolve_alarm: "Alarm cleared"
};

/**
 * Owns the simulation loop. Emits typed events that the socket layer
 * relays to clients. All state mutation is delegated to DeviceStore /
 * AlertStore so there is one authoritative place for "current state".
 */
export class DeviceSimulator extends EventEmitter {
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly deviceStore: DeviceStore,
    private readonly alertStore: AlertStore,
    private readonly tickIntervalMs: number
  ) {
    super();
  }

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), this.tickIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  /** One simulation step: drift a handful of online devices, and
   *  occasionally roll the dice for a random scenario. */
  private tick(): void {
    const devices = this.deviceStore.getAll();
    if (devices.length === 0) return;

    // Drift telemetry for a random subset of online devices each tick,
    // rather than all of them, so updates feel organic and staggered.
    const sampleSize = Math.max(1, Math.floor(devices.length * 0.15));
    for (let i = 0; i < sampleSize; i += 1) {
      const device = devices[randomInt(0, devices.length - 1)];
      if (device.status !== "online") continue;
      this.driftTelemetry(device.id);
    }

    // Small chance per tick of a random scenario on a random device.
    if (chance(0.12)) {
      const device = devices[randomInt(0, devices.length - 1)];
      const eventType = pickRandomScenario(device);
      if (eventType) this.applyEvent(device.id, eventType);
    }
  }

  private driftTelemetry(deviceId: string): void {
    const device = this.deviceStore.getById(deviceId);
    if (!device) return;

    const updated = this.deviceStore.update(deviceId, {
      battery: drift(device.battery, 1.5, 0, 100),
      temperature: drift(device.temperature, 0.4, -10, 60),
      signalStrength: drift(device.signalStrength, 3, 0, 100),
      lastSeen: new Date().toISOString()
    });
    if (updated) this.emit("device:updated", updated);
  }

  /** Applies a named scenario to a device. Used by both the random
   *  tick and the POST /api/devices/:id/simulate endpoint, so manual
   *  and automatic triggers behave identically. */
  applyEvent(deviceId: string, eventType: SimulationEventType): Device | undefined {
    const device = this.deviceStore.getById(deviceId);
    if (!device) return undefined;

    switch (eventType) {
      case "disconnect": {
        const updated = this.deviceStore.update(deviceId, {
          status: "offline",
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:disconnected", updated);
          this.emit("device:updated", updated);
        }
        return updated;
      }

      case "reconnect": {
        const updated = this.deviceStore.update(deviceId, {
          status: "online",
          hasFaults: false,
          acPower: true,
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:connected", updated);
          this.emit("device:updated", updated);
          const resolved = this.alertStore.resolveForDevice(deviceId);
          for (const alert of resolved) this.emit("alert:resolved", alert);
          this.recomputePriority(deviceId);
        }
        return this.deviceStore.getById(deviceId);
      }

      case "urgent_alarm": {
        const updated = this.deviceStore.update(deviceId, {
          urgentAlarm: true,
          priority: "urgent",
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:updated", updated);
          const alert = this.alertStore.create({
            deviceId: updated.id,
            deviceName: updated.name,
            buildingName: updated.buildingName,
            priority: "urgent",
            type: eventType,
            message: EVENT_MESSAGES[eventType]
          });
          this.emit("alert:created", alert);
        }
        return updated;
      }

      case "technical_fault": {
        const updated = this.deviceStore.update(deviceId, {
          hasFaults: true,
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:updated", updated);
          const alert = this.alertStore.create({
            deviceId: updated.id,
            deviceName: updated.name,
            buildingName: updated.buildingName,
            priority: "warning",
            type: eventType,
            message: EVENT_MESSAGES[eventType]
          });
          this.emit("alert:created", alert);
          this.recomputePriority(deviceId);
        }
        return this.deviceStore.getById(deviceId);
      }

      case "power_failure": {
        const updated = this.deviceStore.update(deviceId, {
          acPower: false,
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:updated", updated);
          const alert = this.alertStore.create({
            deviceId: updated.id,
            deviceName: updated.name,
            buildingName: updated.buildingName,
            priority: "warning",
            type: eventType,
            message: EVENT_MESSAGES[eventType]
          });
          this.emit("alert:created", alert);
          this.recomputePriority(deviceId);
        }
        return this.deviceStore.getById(deviceId);
      }

      case "resolve_alarm": {
        const updated = this.deviceStore.update(deviceId, {
          urgentAlarm: false,
          hasFaults: false,
          acPower: true,
          lastSeen: new Date().toISOString()
        });
        if (updated) {
          this.emit("device:updated", updated);
          const resolved = this.alertStore.resolveForDevice(deviceId);
          for (const alert of resolved) this.emit("alert:resolved", alert);
          this.recomputePriority(deviceId);
        }
        return this.deviceStore.getById(deviceId);
      }

      default:
        return device;
    }
  }

  /** Priority is derived from current flags so it can never drift out
   *  of sync with the device's actual alarm/fault state. */
  private recomputePriority(deviceId: string): void {
    const device = this.deviceStore.getById(deviceId);
    if (!device) return;
    const priority = device.urgentAlarm ? "urgent" : device.hasFaults || !device.acPower ? "warning" : "normal";
    if (priority !== device.priority) {
      const updated = this.deviceStore.update(deviceId, { priority });
      if (updated) this.emit("device:updated", updated);
    }
  }
}

function pickRandomScenario(device: Device): SimulationEventType | undefined {
  if (device.status === "offline") {
    return chance(0.3) ? "reconnect" : undefined;
  }
  if (device.urgentAlarm || device.hasFaults) {
    return chance(0.25) ? "resolve_alarm" : undefined;
  }
  const roll = Math.random();
  if (roll < 0.08) return "urgent_alarm";
  if (roll < 0.2) return "technical_fault";
  if (roll < 0.28) return "power_failure";
  if (roll < 0.34) return "disconnect";
  return undefined;
}
