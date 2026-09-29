import type { Alert, ConnectionStatus, DashboardSummary, Device } from "../types/domain.js";

export interface DeviceRealtimeState {
  devicesById: Record<string, Device>;
  activeAlertsById: Record<string, Alert>;
  recentlyResolvedAlerts: Alert[];
  summary: DashboardSummary | null;
  connectionStatus: ConnectionStatus;
  lastSyncedAt: string | null;
}

export const MAX_RECENTLY_RESOLVED = 20;

export type DeviceRealtimeAction =
  | { type: "connection:status"; status: ConnectionStatus }
  | { type: "sync:snapshot"; devices: Device[]; alerts: Alert[]; summary: DashboardSummary }
  | { type: "device:updated"; device: Device }
  | { type: "alert:created"; alert: Alert }
  | { type: "alert:resolved"; alert: Alert }
  | { type: "summary:updated"; summary: DashboardSummary };

export const initialDeviceRealtimeState: DeviceRealtimeState = {
  devicesById: {},
  activeAlertsById: {},
  recentlyResolvedAlerts: [],
  summary: null,
  connectionStatus: "connecting",
  lastSyncedAt: null
};
