import { useMutation, type UseMutationResult } from "./useMutation.js";
import { deviceService } from "../api/services/deviceService.js";
import type { Device, SimulationEventType } from "../types/domain.js";

export function useDeviceSimulate(): UseMutationResult<[string, SimulationEventType], Device> {
  return useMutation(async (id: string, eventType: SimulationEventType) => {
    const result = await deviceService.simulate(id, eventType);
    return result.data;
  });
}
