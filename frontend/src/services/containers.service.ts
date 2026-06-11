import api from "@/lib/api";

export const containersService = {
  getContainers: async (params?: { search?: string; status?: string; projectId?: string }) => {
    const res = await api.get("/containers", { params });
    return res.data;
  },
  actionContainer: async (id: string, action: string) => {
    const res = await api.post(`/containers/${id}/action`, { action });
    return res.data;
  },
  deleteContainer: async (id: string) => {
    const res = await api.delete(`/containers/${id}`);
    return res.data;
  }
};
