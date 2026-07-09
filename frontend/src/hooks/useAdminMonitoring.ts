import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";

// Monitoring Types
export interface AdminMonitoringOverviewDto {
  cpu: number;
  ram: number;
  disk: number;
  network: string;
  uptime: string;
}

export interface AdminMonitoringServerInfoDto {
  name: string;
  ip: string;
  provider: string;
  os: string;
  dockerVersion: string;
  uptime: string;
}

export interface AdminMonitoringServiceDto {
  name: string;
  status: 'Active' | 'Warning' | 'Error' | 'Down';
}

export interface AdminMonitoringTopContainerDto {
  id: string;
  name: string;
  cpu: number;
  ram: number;
  project: string;
}

export interface AdminMonitoringHistoricalDto {
  name: string;
  cpu: number;
  ram: number;
}

export interface AdminMonitoringResponseDto {
  overview: AdminMonitoringOverviewDto;
  serverInfo: AdminMonitoringServerInfoDto;
  services: AdminMonitoringServiceDto[];
  topContainers: AdminMonitoringTopContainerDto[];
  historical: AdminMonitoringHistoricalDto[];
}

export function useAdminMonitoring(range: string = '7d') {
  return useQuery({
    queryKey: ["adminMonitoring", range],
    queryFn: async () => {
      const res = await api.get<AdminMonitoringResponseDto>(`/admin/monitoring?range=${range}`);
      return res.data;
    },
    refetchInterval: 5000, // Refresh stats every 5s
    placeholderData: keepPreviousData,
  });
}
