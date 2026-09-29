import type { DashboardSummary } from "../types/domain.js";
import type { DeviceStore } from "./deviceStore.js";

export function computeSummary(deviceStore: DeviceStore): DashboardSummary {
  const devices = deviceStore.getAll();
  let online = 0;
  let urgent = 0;
  let faults = 0;

  for (const device of devices) {
    if (device.status === "online") online += 1;
    if (device.urgentAlarm) urgent += 1;
    if (device.hasFaults) faults += 1;
  }

  return {
    totalDevices: devices.length,
    onlineDevices: online,
    offlineDevices: devices.length - online,
    urgentAlarms: urgent,
    technicalFaults: faults,
    updatedAt: new Date().toISOString()
  };
}
