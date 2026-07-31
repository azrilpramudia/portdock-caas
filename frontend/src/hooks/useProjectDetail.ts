import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { Project, ProjectEnvironment } from "@/types";
import { AxiosError } from "axios";

export function useProjectDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: project, isLoading, refetch } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchInterval: 5000,
  });

  const { data: stats } = useQuery({
    queryKey: ["project-stats", id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}/stats`);
      return res.data;
    },
    refetchInterval: 5000,
    enabled: !!project && project.status === "ACTIVE",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await api.put(`/projects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Project updated successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update project");
    },
  });

  const updateEnvVarsMutation = useMutation({
    mutationFn: async (envVars: Partial<ProjectEnvironment>[]) => {
      const res = await api.put(`/projects/${id}/env`, { envVars });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      toast.success("Environment variables updated successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to update environment variables");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await api.post('/projects', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    }
  });

  return {
    project,
    isLoading,
    refetch,
    stats,
    updateMutation,
    updateEnvVarsMutation,
    deleteMutation,
    createProjectMutation,
  };
}
