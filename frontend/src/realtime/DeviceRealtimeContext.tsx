import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { getSocket } from "./socketClient.js";
import { deviceRealtimeReducer } from "./deviceRealtimeReducer.js";
import {
  initialDeviceRealtimeState,
  type DeviceRealtimeState,
} from "./types.js";
import type {
  AlertCreatedPayload,
  AlertResolvedPayload,
  DashboardSummaryPayload,
  DeviceUpdatedPayload,
  SyncSnapshotPayload,
} from "../types/domain.js";

const DeviceRealtimeContext = createContext<DeviceRealtimeState | undefined>(
  undefined,
);
export function DeviceRealtimeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    deviceRealtimeReducer,
    initialDeviceRealtimeState,
  );

  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () =>
      dispatch({ type: "connection:status", status: "connected" });
    const handleDisconnect = () =>
      dispatch({ type: "connection:status", status: "disconnected" });
    const handleConnecting = () =>
      dispatch({ type: "connection:status", status: "connecting" });

    const handleSnapshot = (payload: SyncSnapshotPayload) =>
      dispatch({
        type: "sync:snapshot",
        devices: payload.devices,
        alerts: payload.alerts,
        summary: payload.summary,
      });

    const handleDeviceUpdated = (payload: DeviceUpdatedPayload) =>
      dispatch({ type: "device:updated", device: payload.device });

    const handleAlertCreated = (payload: AlertCreatedPayload) =>
      dispatch({ type: "alert:created", alert: payload.alert });

    const handleAlertResolved = (payload: AlertResolvedPayload) =>
      dispatch({ type: "alert:resolved", alert: payload.alert });

    const handleSummary = (payload: DashboardSummaryPayload) =>
      dispatch({ type: "summary:updated", summary: payload.summary });

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleConnecting);
    socket.on("sync:snapshot", handleSnapshot);
    socket.on("device:updated", handleDeviceUpdated);
    socket.on("alert:created", handleAlertCreated);
    socket.on("alert:resolved", handleAlertResolved);
    socket.on("dashboard:summary", handleSummary);
    if (socket.connected) handleConnect();
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleConnecting);
      socket.off("sync:snapshot", handleSnapshot);
      socket.off("device:updated", handleDeviceUpdated);
      socket.off("alert:created", handleAlertCreated);
      socket.off("alert:resolved", handleAlertResolved);
      socket.off("dashboard:summary", handleSummary);
    };
  }, []);

  return (
    <DeviceRealtimeContext.Provider value={state}>
      {children}
    </DeviceRealtimeContext.Provider>
  );
}

export function useDeviceRealtimeState(): DeviceRealtimeState {
  const ctx = useContext(DeviceRealtimeContext);
  if (!ctx)
    throw new Error(
      "useDeviceRealtimeState must be used within a DeviceRealtimeProvider",
    );
  return ctx;
}
