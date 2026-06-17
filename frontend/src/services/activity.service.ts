import api from "@/lib/api";

export const activityService = {
  getLogs: async (params?: { page?: number; limit?: number; search?: string; action?: string; startDate?: string; endDate?: string; status?: string }) => {
    const res = await api.get("/activity-logs", { params });
    return res.data;
  },
  getRecentLogs: async () => {
    const res = await api.get("/activity-logs/recent");
    return res.data;
  },
  exportLogs: async (params?: { search?: string; action?: string; startDate?: string; endDate?: string; status?: string }) => {
    const res = await api.get("/activity-logs/export", { params, responseType: 'blob' });
    return res.data;
  }
};
