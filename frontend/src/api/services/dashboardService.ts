import { httpClient } from "../httpClient.js";
import { endpoints } from "../endpoints.js";
import type { DashboardSummary } from "../../types/domain.js";

export const dashboardService = {
  getSummary(): Promise<{ data: DashboardSummary }> {
    return httpClient.get<{ data: DashboardSummary }>(endpoints.dashboard.summary());
  }
};
