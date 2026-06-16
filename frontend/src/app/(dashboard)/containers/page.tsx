"use client";

import {
  Box,
  Play,
  Pause,
  AlertCircle,
  Search,
  ChevronDown,
  RefreshCw,
  Eye,
  Square,
  Trash2,
  MoreVertical,
  TerminalSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowRight
} from "lucide-react";
import { SiNginx, SiNodedotjs, SiMysql, SiRedis, SiPhp } from "react-icons/si";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { ContainerDetails } from "@/components/containers/ContainerDetails";

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
      port: c.hostPort ? (
        <span className="flex items-center gap-1 whitespace-nowrap">
          {c.hostPort}
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          {c.internalPort}
        </span>
      ) : (c.internalPort || "-"),
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

  const uniqueProjects = Array.from(new Set(rawContainers.map((c: any) => c.project?.name).filter(Boolean)));

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleProjectFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProjectFilter(e.target.value);
    setCurrentPage(1);
  };

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
      <div className="bg-card border border-border rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
          <input 
            type="text" 
            placeholder="Search containers..." 
            value={search}
            onChange={handleSearchChange}
            className="w-full h-[38px] pl-10 pr-4 text-[13px] bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground/70"
          />
        </div>
        
        <div className="relative w-full sm:w-44">
          <select 
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="w-full h-[38px] pl-10 pr-8 text-[13px] font-medium text-foreground bg-card border border-border rounded-xl appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="All Status">All Status</option>
            <option value="Running">Running</option>
            <option value="Stopped">Stopped</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-44">
          <select 
            value={projectFilter}
            onChange={handleProjectFilterChange}
            className="w-full h-[38px] pl-10 pr-8 text-[13px] font-medium text-foreground bg-card border border-border rounded-xl appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
          >
            <option value="All Projects">All Projects</option>
            {(uniqueProjects as string[]).map((proj) => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
        </div>

        <div className="flex-1 hidden sm:block" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleRefresh} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px] font-bold transition-all flex-1 sm:flex-none">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-[15px] font-bold text-foreground mb-6">Containers List</h2>
        
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/80">
              <tr className="border-b border-border text-[13px] font-semibold text-muted-foreground">
                <th className="px-5 py-4 font-semibold w-64">Container Name</th>
                <th className="px-5 py-4 font-semibold">Image</th>
                <th className="px-5 py-4 font-semibold">Project</th>
                <th className="px-5 py-4 font-semibold">Port</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Uptime</th>
                <th className="px-5 py-4 font-semibold">Created At</th>
                <th className="px-5 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-foreground divide-y divide-border bg-card">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                    <p className="font-medium">Loading containers...</p>
                  </td>
                </tr>
              ) : paginatedContainers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground font-medium">
                    {rawContainers.length === 0 ? "No containers found" : "No containers match your filters"}
                  </td>
                </tr>
              ) : (
                paginatedContainers.map((c: any) => (
                  <tr key={c.id} className="group hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <c.icon className={`w-8 h-8 ${c.iconColor} flex-shrink-0`} />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-[14px] leading-tight truncate max-w-[130px]" title={c.name}>{c.name}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5 truncate max-w-[130px]">{c.containerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">
                      <div className="truncate max-w-[130px]" title={c.image}>{c.image}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">
                      <div className="truncate max-w-[90px]" title={c.project}>{c.project}</div>
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.port}</td>
                    <td className="px-5 py-4">
                      {c.status === "Running" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Running
                        </span>
                      )}
                      {c.status === "Stopped" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-muted-foreground text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" /> Stopped
                        </span>
                      )}
                      {c.status === "Failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.uptime}</td>
                    <td className="px-5 py-4 font-medium text-muted-foreground">{c.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedContainer({ id: c.id, name: c.name })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${selectedContainer?.id === c.id ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground border-border bg-card'}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {c.status === "Running" ? (
                          <>
                            <button 
                              onClick={() => restartMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border bg-card"
                              title="Restart"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => stopMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/20 bg-destructive/10 transition-colors border border-destructive/20"
                              title="Stop"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 bg-emerald-500/10 transition-colors border border-emerald-500/20"
                              title="Start"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                            <button 
                              onClick={() => deleteMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-500/20 bg-red-500/10 transition-colors border border-red-500/20"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border bg-card outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl border-border shadow-lg p-1">
                            <DropdownMenuItem 
                              className="cursor-pointer font-semibold text-[13px] text-muted-foreground hover:text-blue-600 focus:text-blue-600 focus:bg-blue-500/10 py-2 rounded-lg"
                              onClick={() => setSelectedContainer({ id: c.id, name: c.name })}
                            >
                              <TerminalSquare className="w-4 h-4 mr-2" /> View Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border my-1" />
                            
                            {c.status === "Running" ? (
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer font-semibold text-[13px] text-muted-foreground py-2 rounded-lg hover:text-foreground focus:text-foreground focus:bg-muted"
                                  onClick={() => restartMutation.mutate(c.id)}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" /> Restart
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer font-semibold text-[13px] text-muted-foreground py-2 rounded-lg hover:text-foreground focus:text-foreground focus:bg-muted"
                                  onClick={() => stopMutation.mutate(c.id)}
                                >
                                  <Square className="w-4 h-4 mr-2" /> Stop
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer font-semibold text-[13px] text-muted-foreground py-2 rounded-lg hover:text-foreground focus:text-foreground focus:bg-muted"
                                onClick={() => startMutation.mutate(c.id)}
                              >
                                <Play className="w-4 h-4 mr-2" /> Start
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-border my-1" />
                            <DropdownMenuItem 
                              className="cursor-pointer font-semibold text-[13px] text-red-600 dark:text-red-400 hover:text-red-700 focus:text-red-700 focus:bg-red-500/10 py-2 rounded-lg"
                              onClick={() => deleteMutation.mutate(c.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pt-6 mt-2 border-t border-border flex items-center justify-between">
          <p className="text-[13px] font-medium text-muted-foreground">
            Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredContainers.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredContainers.length)} of {filteredContainers.length} containers
          </p>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground/70 bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] transition-colors ${
                  currentPage === page
                    ? "text-blue-600 dark:text-blue-400 font-bold bg-card border border-blue-500 shadow-[0_2px_8px_rgba(37,99,235,0.15)]"
                    : "text-muted-foreground font-medium bg-card border border-border hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground/70 bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. SELECTED CONTAINER DETAIL */}
      {selectedContainer && (
        <ContainerDetails 
          containerId={selectedContainer.id}
          containerName={selectedContainer.name}
          onClose={() => setSelectedContainer(null)}
        />
      )}

    </div>
  );
}
