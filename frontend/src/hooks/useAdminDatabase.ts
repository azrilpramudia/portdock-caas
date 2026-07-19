import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useAdminDatabase(id: string) {
  return useQuery({
    queryKey: ["admin_database", id],
    queryFn: async () => {
      const response = await api.get(`/admin/databases/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}
