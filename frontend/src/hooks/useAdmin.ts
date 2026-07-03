import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  newUsers: number;
}

export interface UserListItemDto {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  lastLogin: string | null;
  createdAt: string;
  projectsCount: number;
  containersCount: number;
}

export interface AdminUsersResponseDto {
  stats: UserStatsDto;
  users: UserListItemDto[];
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

export function useAdminUsers() {
  return useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await api.get<AdminUsersResponseDto>("/admin/users");
      return res.data;
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const res = await api.patch(`/admin/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });
}
