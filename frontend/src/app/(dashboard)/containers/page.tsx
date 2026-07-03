"use client";

import { Box, Play, Pause, ArrowUp, ArrowDown } from "lucide-react";
import { SiNginx, SiNodedotjs, SiMysql, SiRedis, SiPhp } from "react-icons/si";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useContainers } from "@/hooks/useContainers";
import { ContainerDetails } from "@/components/containers/ContainerDetails";
import { ContainerFilters } from "@/components/containers/ContainerFilters";
import { ContainerTable } from "@/components/containers/ContainerTable";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FailedIcon = ({ className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default function ContainersPage() {
  const {
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
    stats,
    handleRefresh,
    handleSelectToggle,
    handleSelectAll,
    handleBulkAction,
    mutations,
    refetch
  } = useContainers();

  const totalContainers = stats.totalContainers;
  const runningCount = stats.runningCount;
  const stoppedCount = stats.stoppedCount;
  const failedCount = stats.failedCount;

  const statCards = [
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
      icon: FailedIcon,
      color: "text-red-500 dark:text-red-400",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
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
        setStatusFilter={setStatusFilter}
        projectFilter={projectFilter}
        setProjectFilter={setProjectFilter}
        setCurrentPage={setCurrentPage}
        uniqueProjects={uniqueProjects}
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-card border border-border shadow-md rounded-xl p-4 mb-6 flex items-center justify-between sticky top-4 z-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center bg-blue-500 text-white font-bold rounded-full w-6 h-6 text-xs">
              {selectedIds.size}
            </span>
            <span className="text-[14px] font-semibold text-foreground">Containers Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleBulkAction('start')}
              disabled={isBulkProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-md transition-colors disabled:opacity-50"
            >
              Start Selected
            </button>
            <button 
              onClick={() => handleBulkAction('restart')}
              disabled={isBulkProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-md transition-colors disabled:opacity-50"
            >
              Restart Selected
            </button>
            <button 
              onClick={() => handleBulkAction('stop')}
              disabled={isBulkProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 rounded-md transition-colors disabled:opacity-50"
            >
              Stop Selected
            </button>
            <div className="w-px h-6 bg-border mx-1"></div>
            <button 
              onClick={() => handleBulkAction('delete')}
              disabled={isBulkProcessing}
              className="px-3 py-1.5 text-xs font-semibold bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-md transition-colors disabled:opacity-50"
            >
              Delete Selected
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              disabled={isBulkProcessing}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors ml-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 3. DATA TABLE */}
      <ContainerTable 
        containers={paginatedContainers}
        isLoading={isLoading}
        rawContainersCount={rawContainers.length}
        selectedContainer={selectedContainer}
        setSelectedContainer={setSelectedContainer}
        onStart={(id) => mutations.start.mutate(id)}
        onStop={(id) => mutations.stop.mutate(id)}
        onRestart={(id) => mutations.restart.mutate(id)}
        onDelete={(id) => setContainerToDelete(id)}
        selectedIds={selectedIds}
        onSelectToggle={handleSelectToggle}
        onSelectAll={handleSelectAll}
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
      {!!selectedContainer && rawContainers.find((c: any) => c.id === selectedContainer.id) && (
        <ContainerDetails 
          container={rawContainers.find((c: any) => c.id === selectedContainer.id)} 
          onClose={() => setSelectedContainer(null)} 
          onRefresh={refetch}
          initialTab={selectedContainer.initialTab}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={!!containerToDelete} onOpenChange={(open) => !open && setContainerToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Container</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this container? This action cannot be undone and all data inside the container will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <button
              onClick={() => setContainerToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
              disabled={mutations.delete.isPending}
            >
              Cancel
            </button>
            <button
              onClick={() => containerToDelete && mutations.delete.mutate(containerToDelete)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2"
              disabled={mutations.delete.isPending}
            >
              {mutations.delete.isPending ? "Deleting..." : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
