import api from "@/lib/api";

export const monitoringService = {
  getDashboardStats: async () => {
    const res = await api.get("/monitoring/dashboard");
    return res.data;
  },
  getContainerStats: async (containerId: string) => {
    const res = await api.get(`/monitoring/${containerId}/stats`);
    return res.data;
  }
};
