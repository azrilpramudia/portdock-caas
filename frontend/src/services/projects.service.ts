import api from "@/lib/api";

export const projectsService = {
  getProjects: async (params?: { search?: string; status?: string; limit?: number }) => {
    const res = await api.get("/projects", { params });
    return res.data;
  },
  getProjectById: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data;
  },
  createProject: async (data: any) => {
    const res = await api.post("/projects", data);
    return res.data;
  },
  deleteProject: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  }
};
