import { useEffect, useRef, useState } from "react";
import { deviceService } from "../api/services/deviceService.js";
import { useAsync } from "./useAsync.js";
import { useDevice } from "./useDevices.js";
import type { Device, TelemetryPoint } from "../types/domain.js";

const MAX_POINTS = 120;

export interface DeviceDetails {
  device: Device | undefined;
  history: TelemetryPoint[];
  loading: boolean;
  error: string | null;
}

export function useDeviceDetails(deviceId: string | undefined): DeviceDetails {
  const liveDevice = useDevice(deviceId);
  const lastVersionAppended = useRef<number | null>(null);
  const [history, setHistory] = useState<TelemetryPoint[]>([]);

  const { data, loading, error } = useAsync(
    () => (deviceId ? deviceService.getById(deviceId) : Promise.resolve(null)),
    [deviceId]
  );

  useEffect(() => {
    if (data) {
      setHistory(data.history);
      lastVersionAppended.current = data.data.version;
    } else {
      setHistory([]);
      lastVersionAppended.current = null;
    }
  }, [data]);

  useEffect(() => {
    if (!liveDevice) return;
    if (lastVersionAppended.current !== null && liveDevice.version <= lastVersionAppended.current) return;

    lastVersionAppended.current = liveDevice.version;
    setHistory((prev) => {
      const next: TelemetryPoint[] = [
        ...prev,
        {
          timestamp: liveDevice.lastSeen,
          battery: liveDevice.battery,
          temperature: liveDevice.temperature,
          signalStrength: liveDevice.signalStrength
        }
      ];
      return next.length > MAX_POINTS ? next.slice(next.length - MAX_POINTS) : next;
    });
  }, [liveDevice]);

  return {
    device: liveDevice ?? data?.data,
    history,
    loading,
    error: error?.message ?? null
  };
}
