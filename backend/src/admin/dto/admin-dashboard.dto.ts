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
  network: string; // e.g., "1.2 GB/s"
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
  status: 'Success' | 'Failed' | 'Building';
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
  status: 'Active' | 'Warning' | 'Error' | 'Down';
}

export class AdminDashboardResponseDto {
  stats: AdminDashboardStatsDto;
  resources: ResourceUsageDto;
  containerStatus: ContainerStatusSummaryDto;
  recentDeployments: RecentDeploymentDto[];
  recentActivity: RecentActivityDto[];
  serviceStatus: ServiceStatusDto[];
}
