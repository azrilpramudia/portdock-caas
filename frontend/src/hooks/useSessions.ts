import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api";
import { Session } from "@/types";
import { AxiosError } from "axios";

export function useSessions() {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery<Session[]>({
    queryKey: ['active-sessions'],
    queryFn: async () => {
      const res = await api.get('/auth/sessions');
      return res.data;
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/auth/sessions/${id}`);
    },
    onSuccess: () => {
      toast.success("Session revoked successfully");
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to revoke session");
    },
  });

  return { sessionsQuery, revokeSessionMutation };
}
