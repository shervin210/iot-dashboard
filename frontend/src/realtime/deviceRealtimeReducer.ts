import {
  MAX_RECENTLY_RESOLVED,
  type DeviceRealtimeAction,
  type DeviceRealtimeState
} from "./types.js";

export function deviceRealtimeReducer(
  state: DeviceRealtimeState,
  action: DeviceRealtimeAction
): DeviceRealtimeState {
  switch (action.type) {
    case "connection:status":
      return { ...state, connectionStatus: action.status };

    case "sync:snapshot": {
      const devicesById: DeviceRealtimeState["devicesById"] = {};
      for (const device of action.devices) devicesById[device.id] = device;

      const activeAlertsById: DeviceRealtimeState["activeAlertsById"] = {};
      for (const alert of action.alerts) activeAlertsById[alert.id] = alert;

      return {
        ...state,
        devicesById,
        activeAlertsById,
        summary: action.summary,
        connectionStatus: "connected",
        lastSyncedAt: new Date().toISOString()
      };
    }

    case "device:updated": {
      const existing = state.devicesById[action.device.id];
      if (existing && action.device.version <= existing.version) {
        return state;
      }
      return {
        ...state,
        devicesById: { ...state.devicesById, [action.device.id]: action.device }
      };
    }

    case "alert:created":
      return {
        ...state,
        activeAlertsById: { ...state.activeAlertsById, [action.alert.id]: action.alert }
      };

    case "alert:resolved": {
      if (!(action.alert.id in state.activeAlertsById)) return state;
      const { [action.alert.id]: _removed, ...rest } = state.activeAlertsById;
      return {
        ...state,
        activeAlertsById: rest,
        recentlyResolvedAlerts: [action.alert, ...state.recentlyResolvedAlerts].slice(0, MAX_RECENTLY_RESOLVED)
      };
    }

    case "summary:updated":
      return { ...state, summary: action.summary };

    default:
      return state;
  }
}
