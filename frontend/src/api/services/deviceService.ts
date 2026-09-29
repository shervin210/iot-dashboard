import { httpClient } from "../httpClient.js";
import { endpoints } from "../endpoints.js";
import type {
  Device,
  DeviceListParams,
  PaginationMeta,
  SimulationEventType,
  TelemetryPoint
} from "../../types/domain.js";

export interface DeviceListResult {
  data: Device[];
  pagination: PaginationMeta;
}

export interface DeviceDetailResult {
  data: Device;
  history: TelemetryPoint[];
}
export const deviceService = {
  list(params: DeviceListParams = {}): Promise<DeviceListResult> {
    return httpClient.get<DeviceListResult>(endpoints.devices.list(), { params });
  },

  getById(id: string): Promise<DeviceDetailResult> {
    return httpClient.get<DeviceDetailResult>(endpoints.devices.detail(id));
  },

  simulate(id: string, eventType: SimulationEventType): Promise<{ data: Device }> {
    return httpClient.post<{ data: Device }>(endpoints.devices.simulate(id), { eventType });
  }
};
