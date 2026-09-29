import { useMemo } from "react";
import { useDeviceRealtimeState } from "../realtime/DeviceRealtimeContext.js";
import type { Alert, ConnectionStatus, DashboardSummary } from "../types/domain.js";

export interface AlertsState {
  active: Alert[];
  recentlyResolved: Alert[];
}

export function useAlerts(): AlertsState {
  const { activeAlertsById, recentlyResolvedAlerts } = useDeviceRealtimeState();

  const active = useMemo(
    () => Object.values(activeAlertsById).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [activeAlertsById]
  );

  return { active, recentlyResolved: recentlyResolvedAlerts };
}

export function useDashboardSummary(): DashboardSummary | null {
  return useDeviceRealtimeState().summary;
}

export function useConnectionStatus(): { status: ConnectionStatus; lastSyncedAt: string | null } {
  const { connectionStatus, lastSyncedAt } = useDeviceRealtimeState();
  return { status: connectionStatus, lastSyncedAt };
}
