import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import { ManagedDatabase, DatabaseBackup, ContainerStats } from "@/types";
import { AxiosError } from "axios";

export function useDatabases() {
  const queryClient = useQueryClient();

  const { data: databases = [], isLoading, refetch } = useQuery<ManagedDatabase[]>({
    queryKey: ["databases"],
    queryFn: async () => {
      const res = await api.get("/databases");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/databases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database deleted successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete database");
    },
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database started successfully");
    },
    onError: () => toast.error("Failed to start database"),
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database stopped successfully");
    },
    onError: () => toast.error("Failed to stop database"),
  });

  const restartMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/restart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database restarted successfully");
    },
    onError: () => toast.error("Failed to restart database"),
  });

  return {
    databases,
    isLoading,
    refetch,
    deleteMutation,
    startMutation,
    stopMutation,
    restartMutation,
  };
}

export function useDatabaseBackups(databaseId?: string) {
  const queryClient = useQueryClient();

  const { data: backups = [], isLoading: isBackupsLoading } = useQuery<DatabaseBackup[]>({
    queryKey: ["backups", databaseId],
    queryFn: async () => {
      if (!databaseId) return [];
      const res = await api.get(`/databases/${databaseId}/backups`);
      return res.data;
    },
    enabled: !!databaseId,
  });

  const createBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/databases/${id}/backups`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups", databaseId] });
      toast.success("Backup created successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to create backup");
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async ({ dbId, backupId }: { dbId: string, backupId: string }) => {
      await api.delete(`/databases/${dbId}/backups/${backupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups", databaseId] });
      toast.success("Backup deleted successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to delete backup");
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async ({ dbId, backupId }: { dbId: string, backupId: string }) => {
      await api.post(`/databases/${dbId}/backups/${backupId}/restore`);
    },
    onSuccess: () => {
      toast.success("Backup restored successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast.error(err.response?.data?.message || "Failed to restore backup");
    },
  });

  return {
    backups,
    isBackupsLoading,
    createBackupMutation,
    deleteBackupMutation,
    restoreBackupMutation,
  };
}

export function useDatabaseDetail(id: string) {
  const queryClient = useQueryClient();

  const { data: db, isLoading } = useQuery<ManagedDatabase>({
    queryKey: ["database", id],
    queryFn: async () => {
      const res = await api.get(`/databases/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: stats } = useQuery<ContainerStats>({
    queryKey: ["database-stats", id],
    queryFn: async () => {
      const res = await api.get(`/databases/${id}/stats`);
      return res.data;
    },
    refetchInterval: 5000,
    enabled: !!db && db.status === "RUNNING",
  });

  const restartMutation = useMutation({
    mutationFn: async () => await api.post(`/databases/${id}/restart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["database", id] });
      toast.success("Database restarted successfully");
    },
    onError: () => toast.error("Failed to restart database"),
  });

  const resetPasswordMutation = useMutation<{ dbPassword: string }, AxiosError<{ message: string }>, void, unknown>({
    mutationFn: async () => {
      const res = await api.post(`/databases/${id}/reset-password`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["database", id] });
    },
  });

  return {
    db,
    isLoading,
    stats,
    restartMutation,
    resetPasswordMutation,
  };
}
