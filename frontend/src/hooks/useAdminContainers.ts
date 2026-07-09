import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminContainerListItemDto {
  id: string;
  name: string;
  dockerContainerId: string | null;
  imageName: string;
  imageTag: string;
  status: "RUNNING" | "STOPPED" | "BUILDING" | "ERROR" | "REMOVING" | "FAILED";
  cpuLimit: number | null;
  memoryLimit: number | null;
  createdAt: string;
  updatedAt: string;
  liveStats?: {
    cpuPercent: number;
    memoryUsage: number;
    memoryLimit: number;
    memoryPercent: number;
  } | null;
  project: {
    id: string;
    name: string;
    domain: string | null;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface ContainerStatsDto {
  totalContainers: number;
  runningContainers: number;
  stoppedContainers: number;
  exitedContainers: number;
  totalImages: number;
  totalContainersTrend?: number;
  runningContainersTrend?: number;
  stoppedContainersTrend?: number;
  exitedContainersTrend?: number;
  totalImagesTrend?: number;
}

export interface AdminContainersResponseDto {
  stats: ContainerStatsDto;
  containers: AdminContainerListItemDto[];
}

export function useAdminContainers(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["adminContainers", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<AdminContainersResponseDto>(`/admin/containers${queryString}`);
      return res.data;
    },
    refetchInterval: 5000,
  });
}

export function useAdminContainerAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'start' | 'stop' | 'restart' | 'delete' }) => {
      if (action === 'delete') {
        const res = await api.delete(`/admin/containers/${id}`);
        return res.data;
      } else {
        const res = await api.post(`/admin/containers/${id}/${action}`);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminContainers"] });
    },
  });
}
