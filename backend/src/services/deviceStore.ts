import type { Device, TelemetryPoint } from "../types/domain.js";

const MAX_HISTORY_POINTS = 120;

/**
 * Single authoritative, in-memory store for device state.
 *
 * Every mutation goes through `upsert`, which bumps a per-device
 * `version` counter. Consumers (REST + socket layer) always read from
 * here, so there is exactly one source of truth for "current state"
 * as required by the spec.
 */
export class DeviceStore {
  private devices = new Map<string, Device>();
  private history = new Map<string, TelemetryPoint[]>();

  seed(devices: Device[]): void {
    for (const device of devices) {
      this.devices.set(device.id, device);
      this.history.set(device.id, [
        {
          timestamp: device.lastSeen,
          battery: device.battery,
          temperature: device.temperature,
          signalStrength: device.signalStrength
        }
      ]);
    }
  }

  getAll(): Device[] {
    return Array.from(this.devices.values());
  }

  getById(id: string): Device | undefined {
    return this.devices.get(id);
  }

  /** Applies a partial update, bumps the version, and returns the new
   *  device state. Returns undefined if the device does not exist. */
  update(id: string, patch: Partial<Omit<Device, "id" | "version">>): Device | undefined {
    const current = this.devices.get(id);
    if (!current) return undefined;

    const next: Device = {
      ...current,
      ...patch,
      id: current.id,
      version: current.version + 1
    };
    this.devices.set(id, next);

    if (patch.battery !== undefined || patch.temperature !== undefined || patch.signalStrength !== undefined) {
      this.recordHistory(next);
    }

    return next;
  }

  private recordHistory(device: Device): void {
    const points = this.history.get(device.id) ?? [];
    points.push({
      timestamp: device.lastSeen,
      battery: device.battery,
      temperature: device.temperature,
      signalStrength: device.signalStrength
    });
    if (points.length > MAX_HISTORY_POINTS) {
      points.splice(0, points.length - MAX_HISTORY_POINTS);
    }
    this.history.set(device.id, points);
  }

  getHistory(id: string): TelemetryPoint[] {
    return this.history.get(id) ?? [];
  }

  count(): number {
    return this.devices.size;
  }
}
