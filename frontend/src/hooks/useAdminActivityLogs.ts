import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export interface AdminActivityLogItemDto {
  id: string;
  userId: string;
  projectId: string | null;
  action: string;
  description: string | null;
  status: string;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  project?: {
    name: string;
  } | null;
}

export interface ActivityLogStatsDto {
  totalActivities: number;
  userActivities: number;
  systemActivities: number;
  deploymentActivities: number;
  securityActivities: number;
  totalActivitiesTrend: string;
  userActivitiesTrend: string;
  systemActivitiesTrend: string;
  deploymentActivitiesTrend: string;
  securityActivitiesTrend: string;
}

export interface AdminActivityLogsResponse {
  stats: ActivityLogStatsDto;
  activities: AdminActivityLogItemDto[];
  total: number;
  page: number;
  totalPages: number;
}

export function useAdminActivityLogs(filters?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["adminActivityLogs", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
      const queryString = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<AdminActivityLogsResponse>(`/admin/activity-logs${queryString}`);
      return res.data;
    },
    refetchInterval: 10000,
  });
}

export async function exportAdminActivityLogs(filters?: Record<string, string | number | undefined>): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });
  }
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const res = await api.get(`/admin/activity-logs/export${queryString}`, { responseType: 'blob' });
  return res.data;
}
