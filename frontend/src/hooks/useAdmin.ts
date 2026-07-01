import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminDashboardStatsDto {
  totalProjects: number;
  totalContainers: number;
  activeDeployments: number;
  totalUsers: number;
  successRate: number;
  runningContainers: number;
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
  status: "Active" | "Warning" | "Error";
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
    queryFn: async (): Promise<AdminDashboardResponseDto> => {
      const { data } = await api.get("/admin/dashboard");
      return data;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
