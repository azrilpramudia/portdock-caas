import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminProjectListItemDto {
  id: string;
  name: string;
  domain: string | null;
  status: "ACTIVE" | "INACTIVE" | "BUILDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
  templateId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  _count: {
    containers: number;
  };
}

export interface ProjectStatsDto {
  totalProjects: number;
  activeProjects: number;
  pausedProjects: number;
  failedProjects: number;
  deploymentsToday: number;
  totalProjectsTrend?: number;
  activeProjectsTrend?: number;
  pausedProjectsTrend?: number;
  failedProjectsTrend?: number;
  deploymentsTrend?: number;
}

export interface AdminProjectsResponseDto {
  stats: ProjectStatsDto;
  projects: AdminProjectListItemDto[];
}

export function useAdminProjects(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["adminProjects", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<AdminProjectsResponseDto>(`/admin/projects${queryString}`);
      return res.data;
    },
  });
}

export function useDeleteAdminProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await api.delete(`/admin/projects/${projectId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useUpdateAdminProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.patch(`/admin/projects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useSuspendAdminProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/projects/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useResumeAdminProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/projects/${id}/resume`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useResetAdminProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/projects/${id}/reset-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProjects"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}
