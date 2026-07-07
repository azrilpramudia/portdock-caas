import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useAdminProjects() {
  return useQuery({
    queryKey: ["adminProjects"],
    queryFn: async () => {
      const res = await api.get<AdminProjectsResponseDto>("/admin/projects");
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
    name: string;
    domain: string | null;
    user: {
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

export function useAdminContainers() {
  return useQuery({
    queryKey: ["adminContainers"],
    queryFn: async () => {
      const res = await api.get<AdminContainersResponseDto>("/admin/containers");
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
