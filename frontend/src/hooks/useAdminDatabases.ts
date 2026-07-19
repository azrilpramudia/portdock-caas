import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface AdminDatabasesResponse {
  stats: {
    totalDatabases: number;
    runningDatabases: number;
  };
  databases: any[];
}

export function useAdminDatabases() {
  return useQuery<AdminDatabasesResponse>({
    queryKey: ["admin_databases"],
    queryFn: async () => {
      const response = await api.get(`/admin/databases`);
      return response.data;
    },
  });
}
