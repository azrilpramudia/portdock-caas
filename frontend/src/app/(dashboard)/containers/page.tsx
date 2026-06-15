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
  ArrowDown
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
  const [selectedContainer, setSelectedContainer] = useState<{id: string, name: string} | null>(null);
  const queryClient = useQueryClient();

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
      port: `${c.hostPort}->${c.internalPort}`,
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

  const stats = [
    {
      title: "Total Containers",
      value: totalContainers.toString(),
      trend: "",
      trendUp: true,
      icon: Box,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Running",
      value: runningCount.toString(),
      trend: "",
      trendUp: true,
      icon: Play,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      title: "Stopped",
      value: stoppedCount.toString(),
      trend: "",
      trendUp: false,
      icon: Pause,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Failed",
      value: failedCount.toString(),
      trend: "",
      trendUp: false,
      icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" fill="currentColor" strokeWidth={0} viewBox="0 0 24 24" style={{ stroke: "none" }} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-700 mb-0.5">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-none mb-1.5">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-[11px] font-bold ${stat.trendUp ? "text-emerald-500" : "text-red-500"}`}>
                {stat.trendUp ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. FILTERS */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full sm:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search container..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative w-full sm:w-44">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer transition-colors"
          >
            <option value="All Status">All Status</option>
            <option value="Running">Running</option>
            <option value="Stopped">Stopped</option>
            <option value="Failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-44">
          <select 
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="w-full h-10 px-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer transition-colors"
          >
            <option value="All Projects">All Projects</option>
            {(uniqueProjects as string[]).map((proj) => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex-1 hidden sm:block" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button onClick={handleRefresh} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px] font-bold transition-all flex-1 sm:flex-none">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* 3. DATA TABLE */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 overflow-hidden">
        <h2 className="text-[15px] font-bold text-slate-900 mb-6">Containers List</h2>
        
        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80">
              <tr className="border-b border-slate-200/60 text-[13px] font-semibold text-slate-600">
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
            <tbody className="text-[13px] text-slate-700 divide-y divide-slate-100/50 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-3 text-blue-500 animate-spin" />
                    <p className="font-medium">Loading containers...</p>
                  </td>
                </tr>
              ) : filteredContainers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500 font-medium">
                    {rawContainers.length === 0 ? "No containers found" : "No containers match your filters"}
                  </td>
                </tr>
              ) : (
                filteredContainers.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <c.icon className={`w-8 h-8 ${c.iconColor}`} />
                        <div>
                          <p className="font-bold text-slate-900 text-[14px] leading-tight">{c.name}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{c.containerId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.image}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.project}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.port}</td>
                    <td className="px-5 py-4">
                      {c.status === "Running" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Running
                        </span>
                      )}
                      {c.status === "Stopped" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> Stopped
                        </span>
                      )}
                      {c.status === "Failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-500 text-[12px] font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.uptime}</td>
                    <td className="px-5 py-4 font-medium text-slate-600">{c.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedContainer({ id: c.id, name: c.name })}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors border ${selectedContainer?.id === c.id ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-slate-200/60 bg-white'}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {c.status === "Running" ? (
                          <>
                            <button 
                              onClick={() => restartMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200/60 bg-white"
                              title="Restart"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => stopMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 bg-red-50 transition-colors border border-red-100"
                              title="Stop"
                            >
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 bg-emerald-50 transition-colors border border-emerald-100"
                              title="Start"
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                            <button 
                              onClick={() => deleteMutation.mutate(c.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 bg-red-50 transition-colors border border-red-100"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200/60 bg-white outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 shadow-lg p-1">
                            <DropdownMenuItem 
                              className="cursor-pointer font-semibold text-[13px] text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 py-2 rounded-lg"
                              onClick={() => setSelectedContainer({ id: c.id, name: c.name })}
                            >
                              <TerminalSquare className="w-4 h-4 mr-2" /> View Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            
                            {c.status === "Running" ? (
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer font-semibold text-[13px] text-slate-600 py-2 rounded-lg"
                                  onClick={() => restartMutation.mutate(c.id)}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" /> Restart
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer font-semibold text-[13px] text-slate-600 py-2 rounded-lg"
                                  onClick={() => stopMutation.mutate(c.id)}
                                >
                                  <Square className="w-4 h-4 mr-2" /> Stop
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer font-semibold text-[13px] text-slate-600 py-2 rounded-lg"
                                onClick={() => startMutation.mutate(c.id)}
                              >
                                <Play className="w-4 h-4 mr-2" /> Start
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator className="bg-slate-100 my-1" />
                            <DropdownMenuItem 
                              className="cursor-pointer font-semibold text-[13px] text-red-600 hover:text-red-700 focus:text-red-700 focus:bg-red-50 py-2 rounded-lg"
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
        <div className="pt-6 mt-2 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[13px] font-medium text-slate-500">Showing 1 to {filteredContainers.length} of {filteredContainers.length} containers</p>
          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 font-bold bg-white border border-blue-500 shadow-[0_2px_8px_rgba(37,99,235,0.15)] text-[13px] transition-colors">
              1
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 font-medium bg-white border border-slate-200 hover:bg-slate-50 text-[13px] transition-colors">
              2
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 font-medium bg-white border border-slate-200 hover:bg-slate-50 text-[13px] transition-colors">
              3
            </button>
            <button className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
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
