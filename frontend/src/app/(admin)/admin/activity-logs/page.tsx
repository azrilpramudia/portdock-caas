"use client";

import React, { useState } from "react";
import { Download, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminActivityLogs } from "@/hooks/useAdminActivityLogs";
import { AdminActivityLogsStats } from "@/components/admin/activity-logs/AdminActivityLogsStats";
import { AdminActivityLogsFilters } from "@/components/admin/activity-logs/AdminActivityLogsFilters";
import { AdminActivityLogsTable } from "@/components/admin/activity-logs/AdminActivityLogsTable";

export default function ActivityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading } = useAdminActivityLogs({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    action: actionFilter !== "all" ? actionFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    dateRange: dateRange !== "all" ? dateRange : undefined,
  });

  const activities = data?.activities || [];
  const stats = data?.stats;
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.total || 0;

  const uniqueUsers = Array.from(new Set(activities.map(a => a.user.name)));
  const uniqueActions = ["Login", "Create", "Start", "Stop", "Delete", "Deploy", "Update", "Alert"];
  const uniqueResources = ["System", "Project", "Container", "Deployment", "Domain"];
  const uniqueStatuses = ["Success", "Failed", "Warning"];

  // Apply remaining local filters (user name and resource type which are derived)
  const filteredActivities = activities.filter((activity) => {
    const activityResourceType = activity.projectId ? "Project/Container" : "System";
    const matchesUser = userFilter === "all" || activity.user.name === userFilter;
    const matchesResource = resourceFilter === "all" || activityResourceType.includes(resourceFilter) || resourceFilter === "System";
    return matchesUser && matchesResource;
  });

  const handleExport = () => {
    toast.success("Activity logs exported successfully!");
  };

  const getTypeColor = (type: string) => {
    if (type.includes("System") || type.includes("Service")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    if (type.includes("Project")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (type.includes("Container")) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (type.includes("Deployment")) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (type.includes("Domain")) return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400";
    if (type.includes("Alert")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
  };

  const getStatusColor = (status: string) => {
    if (status === 'Success') return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30 dark:text-emerald-400";
    if (status === 'Failed') return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400";
    return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900/30 dark:text-yellow-400";
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="space-y-6 pb-10 w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-foreground font-medium">Activity Logs</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="h-10 px-4 text-sm font-medium bg-background border-input flex items-center gap-2 flex-1 sm:flex-auto">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="whitespace-nowrap">{dateRange === "all" ? "All Time" : dateRange === "7days" ? "Last 7 Days" : "Last 30 Days"}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => setDateRange("all")}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("7days")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateRange("30days")}>Last 30 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="h-10 px-4 text-sm font-medium bg-background border-input flex items-center gap-2 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      <AdminActivityLogsStats stats={stats} />

      <AdminActivityLogsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        resourceFilter={resourceFilter}
        setResourceFilter={setResourceFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        setCurrentPage={setCurrentPage}
        uniqueUsers={uniqueUsers}
        uniqueActions={uniqueActions}
        uniqueResources={uniqueResources}
        uniqueStatuses={uniqueStatuses}
      />

      <AdminActivityLogsTable
        isLoading={isLoading}
        filteredActivities={filteredActivities}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        getTypeColor={getTypeColor}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}
