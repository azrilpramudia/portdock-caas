"use client";

import { Box, Play, Pause, AlertCircle, ArrowUp, ArrowDown } from "lucide-react";
import { SiNginx, SiNodedotjs, SiMysql, SiRedis, SiPhp } from "react-icons/si";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { ContainerDetails } from "@/components/containers/ContainerDetails";
import { ContainerFilters } from "@/components/containers/ContainerFilters";
import { ContainerTable } from "@/components/containers/ContainerTable";

export default function ContainersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [projectFilter, setProjectFilter] = useState("All Projects");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContainer, setSelectedContainer] = useState<{id: string, name: string} | null>(null);
  
  const queryClient = useQueryClient();
  const ITEMS_PER_PAGE = 10;

  const { data: containersData, isLoading, refetch } = useQuery({
    queryKey: ["containers"],
    queryFn: () => containersService.getContainers(),
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
      toast.success("Container deleted");
    },
  });

  const rawContainers = containersData || [];

  const getIcon = (imageName: string) => {
    if (imageName.includes('nginx')) return { icon: SiNginx, color: 'text-emerald-500' };
    if (imageName.includes('node')) return { icon: SiNodedotjs, color: 'text-emerald-600' };
    if (imageName.includes('mysql')) return { icon: SiMysql, color: 'text-blue-500' };
    if (imageName.includes('redis')) return { icon: SiRedis, color: 'text-red-500' };
    if (imageName.includes('php')) return { icon: SiPhp, color: 'text-indigo-500' };
    return { icon: Box, color: 'text-blue-600' };
  };

  const mappedContainers = rawContainers.map((c: any) => {
    const { icon, color } = getIcon(c.imageName);
    return {
      id: c.id,
      containerId: c.dockerContainerId?.substring(0, 12) || '-',
      name: c.name,
      image: `${c.imageName}:${c.imageTag}`,
      project: c.project?.name || '-',
      port: c.hostPort ? `${c.hostPort} -> ${c.internalPort}` : (c.internalPort || "-"),
      status: c.status === 'RUNNING' ? 'Running' : c.status === 'FAILED' ? 'Failed' : 'Stopped',
      uptime: c.status === 'RUNNING' ? 'Active' : '-',
      createdAt: format(new Date(c.createdAt), 'MMM dd, yyyy'),
      icon: icon,
      iconColor: color,
    };
  });

  const totalContainers = rawContainers.length;
  const runningCount = rawContainers.filter((c: any) => c.status === 'RUNNING').length;
  const stoppedCount = rawContainers.filter((c: any) => c.status === 'STOPPED').length;
  const failedCount = rawContainers.filter((c: any) => c.status === 'FAILED' || c.status === 'ERROR').length;

  const uniqueProjects = Array.from(new Set(rawContainers.map((c: any) => c.project?.name).filter(Boolean))) as string[];

  const filteredContainers = mappedContainers.filter((c: any) => {
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

  const stats = [
    {
      title: "Total Containers",
      value: totalContainers.toString(),
      trend: "",
      trendUp: true,
      icon: Box,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Running",
      value: runningCount.toString(),
      trend: "",
      trendUp: true,
      icon: Play,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Stopped",
      value: stoppedCount.toString(),
      trend: "",
      trendUp: false,
      icon: Pause,
      color: "text-amber-500 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Failed",
      value: failedCount.toString(),
      trend: "",
      trendUp: false,
      icon: AlertCircle,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" style={{ stroke: "none" }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-muted-foreground mb-0.5">{stat.title}</p>
              <h3 className="text-2xl font-black text-foreground leading-none mb-1.5">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.trendUp ? "text-emerald-500" : "text-red-500"}`}>
                {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. FILTERS */}
      <ContainerFilters 
        search={search}
        onSearchChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        statusFilter={statusFilter}
        onStatusFilterChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
        projectFilter={projectFilter}
        onProjectFilterChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
        uniqueProjects={uniqueProjects}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* 3. DATA TABLE */}
      <ContainerTable 
        containers={paginatedContainers}
        isLoading={isLoading}
        rawContainersCount={rawContainers.length}
        selectedContainer={selectedContainer}
        setSelectedContainer={setSelectedContainer}
        onStart={(id) => startMutation.mutate(id)}
        onStop={(id) => stopMutation.mutate(id)}
        onRestart={(id) => restartMutation.mutate(id)}
        onDelete={(id) => deleteMutation.mutate(id)}
      />

      {/* 4. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm bg-card border border-border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-card border border-border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Container Details Sidebar/Modal */}
      {!!selectedContainer && (
        <ContainerDetails 
          containerId={selectedContainer.id} 
          containerName={selectedContainer.name}
          onClose={() => setSelectedContainer(null)} 
        />
      )}
    </div>
  );
}
