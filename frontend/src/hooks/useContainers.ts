import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { toast } from "sonner";
import { format } from "date-fns";
import { Box } from "lucide-react";
import { SiNginx, SiNodedotjs, SiMysql, SiRedis, SiPhp } from "react-icons/si";
import { Container } from "@/types";

export interface MappedContainer {
  id: string;
  containerId: string;
  name: string;
  image: string;
  project: string;
  domain: string | null;
  port: string | number;
  hostPort?: number;
  status: string;
  uptime: string;
  createdAt: string;
  icon: any;
  iconColor: string;
}
export const useContainersList = (search: string, statusFilter: string) => {
  return useQuery({
    queryKey: ["containers", search, statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return containersService.getContainers(params);
    },
    refetchInterval: 5000,
  });
};

export const useContainerAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => {
      if (action === 'start') return containersService.startContainer(id);
      if (action === 'stop') return containersService.stopContainer(id);
      if (action === 'restart') return containersService.restartContainer(id);
      throw new Error(`Invalid action: ${action}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Aksi container berhasil");
    },
    onError: () => toast.error("Gagal melakukan aksi container"),
  });
};

export const useDeleteContainer = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => containersService.deleteContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container berhasil dihapus");
      if (onSuccess) onSuccess();
    },
    onError: () => toast.error("Gagal menghapus container"),
  });
};

export function useContainers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContainer, setSelectedContainer] = useState<{id: string, name: string, initialTab?: string} | null>(null);
  const [containerToDelete, setContainerToDelete] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 10;

  const { data: containersData, isLoading, refetch } = useQuery({
    queryKey: ["containers"],
    queryFn: () => containersService.getContainers(),
    refetchInterval: 5000,
  });

  const handleRefresh = async () => {
    await refetch();
    toast.success("Data containers berhasil diperbarui");
  };

  const startMutation = useMutation({
    mutationFn: (id: string) => containersService.startContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container started");
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => containersService.stopContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container stopped");
    },
  });

  const restartMutation = useMutation({
    mutationFn: (id: string) => containersService.restartContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container restarted");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => containersService.deleteContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container deleted successfully");
      setContainerToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete container");
      setContainerToDelete(null);
    }
  });

  // Extract data from standard NestJS standard response { data: [...] }
  const rawContainers = containersData?.data || containersData || [];

  const handleBulkAction = async (action: 'start' | 'stop' | 'restart' | 'delete') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${selectedIds.size} containers?`)) return;
    }

    setIsBulkProcessing(true);
    const toastId = toast.loading(`Processing ${action} on ${selectedIds.size} containers...`);
    
    try {
      const promises = Array.from(selectedIds).map(id => {
        if (action === 'start') return containersService.startContainer(id);
        if (action === 'stop') return containersService.stopContainer(id);
        if (action === 'restart') return containersService.restartContainer(id);
        if (action === 'delete') return containersService.deleteContainer(id);
      });

      await Promise.allSettled(promises);
      
      toast.success(`Successfully executed ${action} on selected containers`, { id: toastId });
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      setSelectedIds(new Set());
    } catch (error: Error | unknown) {
      toast.error(`Some actions failed: ${(error as Error).message}`, { id: toastId });
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const getIcon = (imageName: string) => {
    if (imageName.includes('nginx')) return { icon: SiNginx, color: 'text-emerald-500' };
    if (imageName.includes('node')) return { icon: SiNodedotjs, color: 'text-emerald-600' };
    if (imageName.includes('mysql')) return { icon: SiMysql, color: 'text-blue-500' };
    if (imageName.includes('redis')) return { icon: SiRedis, color: 'text-red-500' };
    if (imageName.includes('php')) return { icon: SiPhp, color: 'text-indigo-500' };
    return { icon: Box, color: 'text-blue-600' };
  };

  const mappedContainers: MappedContainer[] = rawContainers.map((c: Container) => {
    const { icon, color } = getIcon(c.imageName);
    return {
      id: c.id,
      containerId: c.dockerContainerId?.substring(0, 12) || '-',
      name: c.name,
      image: `${c.imageName}:${c.imageTag}`,
      project: c.project?.name || '-',
      domain: c.project?.domain || null,
      port: c.hostPort ? `${c.hostPort} -> ${c.internalPort}` : (c.internalPort || "-"),
      hostPort: c.hostPort,
      status: c.status === 'RUNNING' ? 'Running' : c.status === 'FAILED' ? 'Failed' : 'Stopped',
      uptime: c.status === 'RUNNING' ? 'Active' : '-',
      createdAt: format(new Date(c.createdAt), 'MMM dd, yyyy'),
      icon: icon,
      iconColor: color,
    };
  });

  const totalContainers = rawContainers.length;
  const runningCount = rawContainers.filter((c: Container) => c.status === 'RUNNING').length;
  const stoppedCount = rawContainers.filter((c: Container) => c.status === 'STOPPED').length;
  const failedCount = rawContainers.filter((c: Container) => c.status === 'FAILED' || c.status === 'ERROR').length;
  const uniqueProjects = Array.from(new Set(rawContainers.map((c: Container) => c.project?.name).filter(Boolean))) as string[];

  const filteredContainers = mappedContainers.filter((c: MappedContainer) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.image.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Status" || c.status === statusFilter;
    const matchProject = projectFilter === "All Projects" || c.project === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  const totalPages = Math.max(1, Math.ceil(filteredContainers.length / ITEMS_PER_PAGE));
  const paginatedContainers = filteredContainers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedContainers.length && paginatedContainers.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      paginatedContainers.forEach((c: any) => next.add(c.id));
      setSelectedIds(next);
    }
  };

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    projectFilter, setProjectFilter,
    currentPage, setCurrentPage,
    selectedContainer, setSelectedContainer,
    containerToDelete, setContainerToDelete,
    selectedIds, setSelectedIds,
    isBulkProcessing,
    totalPages,
    rawContainers,
    paginatedContainers,
    uniqueProjects,
    isLoading,
    stats: {
      totalContainers,
      runningCount,
      stoppedCount,
      failedCount
    },
    handleRefresh,
    handleSelectToggle,
    handleSelectAll,
    handleBulkAction,
    mutations: {
      start: startMutation,
      stop: stopMutation,
      restart: restartMutation,
      delete: deleteMutation
    },
    refetch
  };
}
