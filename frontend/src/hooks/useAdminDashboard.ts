import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminDashboardStatsDto {
  totalProjects: number;
  totalContainers: number;
  activeDeployments: number;
  totalUsers: number;
  successRate: number;
  runningContainers: number;
  totalProjectsTrend?: number;
  totalContainersTrend?: number;
  activeDeploymentsTrend?: number;
  totalUsersTrend?: number;
  successRateTrend?: number;
  runningContainersTrend?: number;
}

export interface ResourceUsageDto {
  cpu: number;
  ram: number;
  disk: number;
  network: string;
}

export interface ContainerStatusSummaryDto {
  active: number;
  stopped: number;
  failed: number;
}

export interface RecentDeploymentDto {
  id: string;
  project: string;
  user: string;
  status: "Success" | "Failed" | "Building";
  time: string;
  duration: string;
}

export interface RecentActivityDto {
  id: string;
  user: string;
  action: string;
  project: string;
  time: string;
}

export interface ServiceStatusDto {
  name: string;
  status: "Active" | "Warning" | "Error" | "Down";
}

export interface AdminDashboardResponseDto {
  stats: AdminDashboardStatsDto;
  resources: ResourceUsageDto;
  containerStatus: ContainerStatusSummaryDto;
  recentDeployments: RecentDeploymentDto[];
  recentActivity: RecentActivityDto[];
  serviceStatus: ServiceStatusDto[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await api.get<AdminDashboardResponseDto>("/admin/dashboard");
      return res.data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
