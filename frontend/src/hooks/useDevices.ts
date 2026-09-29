import { useMemo } from "react";
import { useDeviceRealtimeState } from "../realtime/DeviceRealtimeContext.js";
import type { Device, DevicePriority, DeviceStatus } from "../types/domain.js";

export interface DeviceFilters {
  search: string;
  status: DeviceStatus | "all";
  priority: DevicePriority | "all";
}

export const defaultDeviceFilters: DeviceFilters = { search: "", status: "all", priority: "all" };

export function useAllDevices(): Device[] {
  const { devicesById } = useDeviceRealtimeState();
  return useMemo(() => Object.values(devicesById), [devicesById]);
}

export function useDevice(id: string | undefined): Device | undefined {
  const { devicesById } = useDeviceRealtimeState();
  return id ? devicesById[id] : undefined;
}
export function filterDevices(devices: Device[], filters: DeviceFilters): Device[] {
  const term = filters.search.trim().toLowerCase();

  const filtered = devices.filter((device) => {
    if (filters.status !== "all" && device.status !== filters.status) return false;
    if (filters.priority !== "all" && device.priority !== filters.priority) return false;
    if (term && !device.name.toLowerCase().includes(term) && !device.id.toLowerCase().includes(term)) {
      return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
}
export function useFilteredDevices(filters: DeviceFilters): Device[] {
  const devices = useAllDevices();

  return useMemo(
    () => filterDevices(devices, filters),
    [devices, filters.search, filters.status, filters.priority]
  );
}
