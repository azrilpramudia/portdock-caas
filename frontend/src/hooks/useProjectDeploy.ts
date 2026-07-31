import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";

export function useProjectDeploy(projectId: string) {
  const queryClient = useQueryClient();

  const deployGithubMutation = useMutation({
    mutationFn: async (data: { branch: string }) => {
      const res = await api.post(`/projects/${projectId}/deploy/github`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Deployment started via Github");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start Github deployment");
    },
  });

  const deployZipMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/projects/${projectId}/deploy/zip`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Zip deployment started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start Zip deployment");
    },
  });

  const deployDockerfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/projects/${projectId}/deploy/dockerfile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Dockerfile deployment started");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to start Dockerfile deployment");
    },
  });

  return {
    deployGithubMutation,
    deployZipMutation,
    deployDockerfileMutation,
  };
}
