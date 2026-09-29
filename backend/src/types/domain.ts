export type DeviceStatus = "online" | "offline";
export type DevicePriority = "normal" | "warning" | "urgent";

export type SimulationEventType =
  | "urgent_alarm"
  | "technical_fault"
  | "power_failure"
  | "disconnect"
  | "reconnect"
  | "resolve_alarm";

export interface Device {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  status: DeviceStatus;
  priority: DevicePriority;
  battery: number; // 0-100
  signalStrength: number; // 0-100
  temperature: number; // celsius
  acPower: boolean;
  hasFaults: boolean;
  urgentAlarm: boolean;
  lastSeen: string; // ISO timestamp
  latitude: number;
  longitude: number;
  /** Monotonically increasing per-device version so clients can discard
   *  out-of-order events (see "older event arrives late" requirement). */
  version: number;
}

export type AlertPriority = "warning" | "urgent";
export type AlertStatus = "active" | "resolved";

export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  buildingName: string;
  priority: AlertPriority;
  type: SimulationEventType;
  message: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface TelemetryPoint {
  timestamp: string;
  battery: number;
  temperature: number;
  signalStrength: number;
}

export interface DashboardSummary {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  urgentAlarms: number;
  technicalFaults: number;
  updatedAt: string;
}

/** Payloads for the realtime (Socket.IO) event contract. */
export interface DeviceUpdatedPayload {
  device: Device;
}

export interface DeviceConnectionPayload {
  deviceId: string;
  status: DeviceStatus;
  timestamp: string;
  version: number;
}

export interface AlertCreatedPayload {
  alert: Alert;
}

export interface AlertResolvedPayload {
  alert: Alert;
}

export interface DashboardSummaryPayload {
  summary: DashboardSummary;
}
