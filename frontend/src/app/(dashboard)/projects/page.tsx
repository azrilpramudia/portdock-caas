"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, FolderOpen, Container, Database, Rocket, Filter, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import api from "@/lib/api";
import { useProjectsList, useDeleteProject } from "@/hooks/useProjects";
import { StatCard } from "@/components/projects/StatCard";
import { ProjectTable } from "@/components/projects/ProjectTable";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Use the monitoring dashboard stats for the top cards
  const { data: stats, refetch: refetchStats, isRefetching: isRefetchingStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/monitoring/dashboard");
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Main projects list query
  const { data, isLoading, refetch, isRefetching } = useProjectsList(search, statusFilter === "all" ? "" : statusFilter);
  const deleteMutation = useDeleteProject(() => setDeleteId(null));

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchStats()]);
    toast.success("Project data refreshed!", { duration: 2000 });
  };

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-500/10",
      trend: stats?.totalProjects ? "+2" : "",
    },
    {
      title: "Running Projects",
      value: stats?.runningContainers || 0, 
      icon: Container,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-500/10",
      trend: stats?.runningContainers ? "+1" : "",
    },
    {
      title: "Stopped Projects",
      value: Math.max(0, (stats?.totalProjects || 0) - (stats?.runningContainers || 0)),
      icon: Database,
      iconColor: "text-amber-500 dark:text-amber-400",
      iconBgColor: "bg-amber-500/10",
      trend: stats?.totalProjects ? "-1" : "",
      trendColor: "red"
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments || 0,
      icon: Rocket,
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBgColor: "bg-purple-500/10",
      trend: stats?.totalDeployments ? "+5" : "",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-[17px] font-bold text-foreground">All Projects</h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefetching || isRefetchingStats}
                className="h-9 rounded-lg text-[13px] font-semibold border-border bg-card hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isRefetching || isRefetchingStats ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/projects/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px]">
                  <Plus className="w-4 h-4 mr-1.5" /> Create New Project
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-border text-[13px] rounded-xl focus-visible:ring-blue-500/20"
              />
            </div>
            <div className="relative w-40">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-card border-border text-foreground text-[13px] rounded-xl h-10 px-4 font-bold focus:ring-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">
                      {statusFilter === 'all' ? 'All Status' : 
                       statusFilter === 'ACTIVE' ? 'Running' : 
                       statusFilter === 'INACTIVE' ? 'Stopped' : 
                       statusFilter === 'FAILED' ? 'Failed' : 'All Status'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Running</SelectItem>
                  <SelectItem value="INACTIVE">Stopped</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <ProjectTable 
          isLoading={isLoading} 
          projects={data?.data} 
          setDeleteId={setDeleteId} 
        />

      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hapus Project?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tindakan ini tidak dapat dibatalkan. Semua container yang terkait juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-xl border-border hover:bg-muted" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
