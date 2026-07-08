import api from "@/lib/api";

export const containersService = {
  getContainers: async (params?: { search?: string; status?: string; projectId?: string }) => {
    const res = await api.get("/containers", { params });
    return res.data;
  },
  startContainer: async (id: string) => {
    const res = await api.post(`/containers/${id}/start`);
    return res.data;
  },
  stopContainer: async (id: string) => {
    const res = await api.post(`/containers/${id}/stop`);
    return res.data;
  },
  restartContainer: async (id: string) => {
    const res = await api.post(`/containers/${id}/restart`);
    return res.data;
  },
  deleteContainer: async (id: string) => {
    const res = await api.delete(`/containers/${id}`);
    return res.data;
  },
  updateResources: async (id: string, data: { memoryLimit?: number | null; cpuLimit?: number | null; restartPolicy?: string; volumeMountPath?: string | null; internalPort?: number }) => {
    const res = await api.patch(`/admin/containers/${id}/resources`, data);
    return res.data;
  },
  updateInternalPort: async (id: string, port: number) => {
    const res = await api.patch(`/containers/${id}/internal-port`, { port });
    return res.data;
  },
  allocatePort: async (id: string, port: number) => {
    const res = await api.post(`/containers/${id}/allocate-port`, { port });
    return res.data;
  },
  removePort: async (id: string) => {
    const res = await api.delete(`/containers/${id}/allocate-port`);
    return res.data;
  }
};
