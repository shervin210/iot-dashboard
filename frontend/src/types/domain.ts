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
  battery: number;
  signalStrength: number;
  temperature: number;
  acPower: boolean;
  hasFaults: boolean;
  urgentAlarm: boolean;
  lastSeen: string;
  latitude: number;
  longitude: number;
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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DeviceListParams {
  search?: string;
  status?: DeviceStatus;
  priority?: DevicePriority;
  page?: number;
  pageSize?: number;
  sortBy?: "lastSeen";
}

/** Realtime socket payloads (server → client). */
export interface SyncSnapshotPayload {
  devices: Device[];
  alerts: Alert[];
  summary: DashboardSummary;
}

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

export type ConnectionStatus = "connecting" | "connected" | "disconnected";
