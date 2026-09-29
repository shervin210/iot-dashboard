import { httpClient } from "../httpClient.js";
import { endpoints } from "../endpoints.js";
import type { Alert } from "../../types/domain.js";

export interface AlertListResult {
  data: {
    active: Alert[];
    resolved: Alert[];
  };
}

export const alertService = {
  list(includeResolved = false): Promise<AlertListResult> {
    return httpClient.get<AlertListResult>(endpoints.alerts.list(), {
      params: includeResolved ? { includeResolved: "true" } : undefined
    });
  },

  resolve(id: string): Promise<{ data: Alert }> {
    return httpClient.post<{ data: Alert }>(endpoints.alerts.resolve(id));
  }
};
