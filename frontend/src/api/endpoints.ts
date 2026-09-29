export const endpoints = {
  devices: {
    list: () => "/devices",
    detail: (id: string) => `/devices/${id}`,
    simulate: (id: string) => `/devices/${id}/simulate`
  },
  dashboard: {
    summary: () => "/dashboard/summary"
  },
  alerts: {
    list: () => "/alerts",
    resolve: (id: string) => `/alerts/${id}/resolve`
  }
} as const;
