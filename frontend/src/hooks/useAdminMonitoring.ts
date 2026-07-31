import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import api from "@/lib/api";
import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from "@/constants/config";

// Monitoring Types
export interface AdminMonitoringOverviewDto {
  cpu: number;
  ram: number;
  disk: number;
  network: string;
  uptime: string;
  diskPartitions: {
    path: string;
    size: string;
    percent: number;
  }[];
}

export interface AdminMonitoringServerInfoDto {
  name: string;
  ip: string;
  provider: string;
  os: string;
  kernel: string;
  architecture: string;
  dockerVersion: string;
  dockerCompose: string;
  uptime: string;
  timezone: string;
  lastReboot: string;
  currentLoad: string;
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
  disk: number;
}

export interface AdminMonitoringResponseDto {
  overview: AdminMonitoringOverviewDto;
  serverInfo: AdminMonitoringServerInfoDto;
  services: AdminMonitoringServiceDto[];
  topContainers: AdminMonitoringTopContainerDto[];
  historical: AdminMonitoringHistoricalDto[];
  dockerStorage: {
    imagesSize: number;
    containersSize: number;
    volumesSize: number;
    totalSize: number;
  };
}

export function useAdminMonitoring(range: string = '7d') {
  const [data, setData] = useState<AdminMonitoringResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Determine the backend URL by stripping /api if it exists
    const socketUrl = API_BASE_URL.replace(/\/api\/?$/, '');
    
    const socket: Socket = io(`${socketUrl}/admin/metrics`, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to metrics gateway');
      setIsLoading(false);
    });

    socket.on('monitoringStats', (stats: AdminMonitoringResponseDto) => {
      setData(stats);
      setIsLoading(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError(err);
      setIsLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [range]); // We pass range, though currently backend gateway ignores range and defaults to 7d.

  return { data, isLoading, error };
}

export function useAdminServerAction() {
  return useMutation({
    mutationFn: async (action: string) => {
      const res = await api.post<{ success: boolean; message: string }>('/admin/server/action', { action });
      return res.data;
    }
  });
}

export function useAdminServerLogs() {
  return useQuery({
    queryKey: ["adminServerLogs"],
    queryFn: async () => {
      const res = await api.get<{ logs: string }>('/admin/server/logs');
      return res.data.logs;
    },
    enabled: false, // Only fetch when triggered manually by UI
  });
}
