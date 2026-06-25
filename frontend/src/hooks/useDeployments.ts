import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";

export type DeployStatus = "idle" | "deploying" | "success" | "error";

export function useDeployments(projectId: string) {
  const router = useRouter();
  const [deployStatus, setDeployStatus] = useState<DeployStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [deployMessage, setDeployMessage] = useState("");

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) {
          clearInterval(interval);
          return 90;
        }
        return p + Math.random() * 15;
      });
    }, 800);
    return interval;
  };

  const zipMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/deployments/${projectId}/zip`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onMutate: () => {
      setDeployStatus("deploying");
      const interval = simulateProgress();
      return interval;
    },
    onSuccess: (data, _, interval) => {
      clearInterval(interval as any);
      setProgress(100);
      setDeployStatus("success");
      setDeployMessage(data?.message || "Deployment berhasil!");
      toast.success("Deployment berhasil!");
      setTimeout(() => router.push(`/projects/${projectId}`), 2000);
    },
    onError: (error: any, _, interval) => {
      clearInterval(interval as any);
      setDeployStatus("error");
      setDeployMessage(error.response?.data?.message || "Deployment gagal");
      toast.error("Deployment gagal");
    },
  });

  const githubMutation = useMutation({
    mutationFn: async ({ repositoryUrl, branch }: { repositoryUrl: string; branch: string }) => {
      const res = await api.post(`/deployments/${projectId}/github`, {
        repositoryUrl,
        branch,
      });
      return res.data;
    },
    onMutate: () => {
      setDeployStatus("deploying");
      const interval = simulateProgress();
      return interval;
    },
    onSuccess: (data, _, interval) => {
      clearInterval(interval as any);
      setProgress(100);
      setDeployStatus("success");
      setDeployMessage(data?.message || "GitHub deployment berhasil!");
      toast.success("GitHub deployment berhasil!");
      setTimeout(() => router.push(`/projects/${projectId}`), 2000);
    },
    onError: (error: any, _, interval) => {
      clearInterval(interval as any);
      setDeployStatus("error");
      setDeployMessage(error.response?.data?.message || "Deployment gagal");
      toast.error("Deployment gagal");
    },
  });

  const dockerfileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post(`/deployments/${projectId}/dockerfile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onMutate: () => {
      setDeployStatus("deploying");
      const interval = simulateProgress();
      return interval;
    },
    onSuccess: (data, _, interval) => {
      clearInterval(interval as any);
      setProgress(100);
      setDeployStatus("success");
      setDeployMessage(data?.message || "Dockerfile deployment berhasil!");
      toast.success("Dockerfile deployment berhasil!");
      setTimeout(() => router.push(`/projects/${projectId}`), 2000);
    },
    onError: (error: any, _, interval) => {
      clearInterval(interval as any);
      setDeployStatus("error");
      setDeployMessage(error.response?.data?.message || "Deployment gagal");
      toast.error("Deployment gagal");
    },
  });

  return {
    deployStatus,
    progress,
    deployMessage,
    zipMutation,
    githubMutation,
    dockerfileMutation,
  };
}
