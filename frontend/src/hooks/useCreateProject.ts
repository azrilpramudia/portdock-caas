import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Project } from "@/types";

interface CreateProjectData {
  name: string;
  deploymentType: "ZIP" | "GITHUB" | "DOCKERFILE";
  templateId: string;
  description?: string;
  repositoryUrl?: string;
  domain?: string;
  internalPort?: string;
}

export function useCreateProject(
  file: File | null,
  setUploadProgress: (progress: number) => void,
  setDeployedProjectId: (id: string) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProjectData) => {
      if ((data.deploymentType === "ZIP" || data.deploymentType === "DOCKERFILE") && !file) {
        throw new Error("File belum dipilih!");
      }

      const payload = { ...data };
      if (!payload.repositoryUrl) delete payload.repositoryUrl;
      if (!payload.domain) delete payload.domain;
      if (!payload.description) delete payload.description;

      const res = await api.post("/projects", payload);
      const project: Project = res.data;

      if (data.deploymentType === "ZIP" && file) {
        if (!file.name.toLowerCase().endsWith('.zip')) {
          throw new Error("File yang diunggah harus berformat .zip!");
        }
        if (file.size > 50 * 1024 * 1024) { 
          throw new Error("Ukuran file ZIP tidak boleh lebih dari 50MB!");
        }

        const formData = new FormData();
        formData.append("file", file);
        if (data.internalPort) formData.append("internalPort", data.internalPort.toString());
        
        await api.post(`/deployments/${project.id}/zip`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          },
        });
      } else if (data.deploymentType === "GITHUB" && data.repositoryUrl) {
        await api.post(`/deployments/${project.id}/github`, {
          repositoryUrl: data.repositoryUrl,
          branch: "main",
          internalPort: data.internalPort,
        });
      } else if (data.deploymentType === "DOCKERFILE" && file) {
        if (!file.name.toLowerCase().includes('dockerfile')) {
          throw new Error("File yang diunggah harus bernama Dockerfile!");
        }
        if (file.size > 5 * 1024 * 1024) { 
          throw new Error("Ukuran file Dockerfile tidak boleh lebih dari 5MB!");
        }

        const formData = new FormData();
        formData.append("file", file);
        if (data.internalPort) formData.append("internalPort", data.internalPort.toString());
        
        await api.post(`/deployments/${project.id}/dockerfile`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          },
        });
      }

      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeployedProjectId(data.id);
    },
    onError: (error: any) => {
      const errMessage = error.response?.data?.message || error.message || "Gagal melakukan deployment";
      toast.error(errMessage);
    },
  });
}
