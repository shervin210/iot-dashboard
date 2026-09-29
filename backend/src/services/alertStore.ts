import { randomUUID } from "node:crypto";
import type { Alert, AlertPriority, SimulationEventType } from "../types/domain.js";

const MAX_RESOLVED_HISTORY = 200;

export class AlertStore {
  private active = new Map<string, Alert>();
  private resolved: Alert[] = [];
  private sequence = 1000;

  create(input: {
    deviceId: string;
    deviceName: string;
    buildingName: string;
    priority: AlertPriority;
    type: SimulationEventType;
    message: string;
  }): Alert {
    this.sequence += 1;
    const alert: Alert = {
      id: `ALT-${this.sequence}`,
      deviceId: input.deviceId,
      deviceName: input.deviceName,
      buildingName: input.buildingName,
      priority: input.priority,
      type: input.type,
      message: input.message,
      status: "active",
      createdAt: new Date().toISOString()
    };
    this.active.set(alert.id, alert);
    return alert;
  }

  /** Resolves every active alert for a device (e.g. on resolve_alarm or reconnect). */
  resolveForDevice(deviceId: string): Alert[] {
    const resolvedNow: Alert[] = [];
    for (const alert of this.active.values()) {
      if (alert.deviceId === deviceId) {
        const resolvedAlert: Alert = {
          ...alert,
          status: "resolved",
          resolvedAt: new Date().toISOString()
        };
        this.active.delete(alert.id);
        this.resolved.unshift(resolvedAlert);
        resolvedNow.push(resolvedAlert);
      }
    }
    if (this.resolved.length > MAX_RESOLVED_HISTORY) {
      this.resolved.length = MAX_RESOLVED_HISTORY;
    }
    return resolvedNow;
  }

  resolveById(id: string): Alert | undefined {
    const alert = this.active.get(id);
    if (!alert) return undefined;
    const resolvedAlert: Alert = { ...alert, status: "resolved", resolvedAt: new Date().toISOString() };
    this.active.delete(id);
    this.resolved.unshift(resolvedAlert);
    return resolvedAlert;
  }

  getActive(): Alert[] {
    return Array.from(this.active.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  getResolved(limit = 50): Alert[] {
    return this.resolved.slice(0, limit);
  }

  countActiveByPriority(priority: AlertPriority): number {
    let count = 0;
    for (const alert of this.active.values()) {
      if (alert.priority === priority) count += 1;
    }
    return count;
  }

  /** Exposed for tests that need a fresh unique id without creating a full alert. */
  static newId(): string {
    return randomUUID();
  }
}
