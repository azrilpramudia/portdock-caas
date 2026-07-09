import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminDeploymentItemDto {
  id: string;
  projectId: string;
  status: string;
  progress: number;
  domain: string | null;
  startedAt: string;
  endedAt: string | null;
  project: {
    id: string;
    name: string;
    templateId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface DeploymentStatsDto {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  inProgressDeployments: number;
  deploymentsToday: number;
  totalDeploymentsTrend: number;
  successfulDeploymentsTrend: number;
  failedDeploymentsTrend: number;
  inProgressDeploymentsTrend: number;
  deploymentsTodayTrend: number;
}

export function useAdminDeployments(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ["adminDeployments", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<{ stats: DeploymentStatsDto; deployments: AdminDeploymentItemDto[] }>(`/admin/deployments${queryString}`);
      return res.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds for live progress
  });
}
