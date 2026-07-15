"use client";

import { 
  Rocket, Box, Terminal, Play, Square, Layers, Trash2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { ActivityLogsFilter } from "@/components/activity-logs/ActivityLogsFilter";
import { ActivityLogsTable } from "@/components/activity-logs/ActivityLogsTable";
import { formatDateTime } from "@/utils/formatters";

export default function ActivityLogsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [date, setDate] = useState<DateRange | undefined>();

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["activity-logs", currentPage, search, actionFilter, statusFilter, date],
    queryFn: () => activityService.getLogs({ 
      page: currentPage, 
      limit: 15, 
      search: search || undefined, 
      action: actionFilter !== "All Actions" ? actionFilter : undefined,
      status: statusFilter !== "All Status" ? statusFilter : undefined,
      startDate: date?.from ? date.from.toISOString() : undefined,
      endDate: date?.to ? date.to.toISOString() : undefined,
    }),
  });

  const handleExport = async () => {
    try {
      const blob = await activityService.exportLogs({ 
        search: search || undefined, 
        action: actionFilter !== "All Actions" ? actionFilter : undefined,
        status: statusFilter !== "All Status" ? statusFilter : undefined,
        startDate: date?.from ? date.from.toISOString() : undefined,
        endDate: date?.to ? date.to.toISOString() : undefined,
      });
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'activity-logs.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error("Failed to export logs", err);
    }
  };

  const getActionDetails = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('start')) return { icon: <Play className="w-4 h-4" />, bg: "bg-emerald-500/10 text-emerald-500", title: "Started", sub: "Execution started" };
    if (actionLower.includes('stop')) return { icon: <Square className="w-4 h-4" />, bg: "bg-amber-500/10 text-amber-500", title: "Stopped", sub: "Execution stopped" };
    if (actionLower.includes('delete') || actionLower.includes('destroy')) return { icon: <Trash2 className="w-4 h-4" />, bg: "bg-red-500/10 text-red-500", title: "Deleted", sub: "Resource removed" };
    if (actionLower.includes('create')) return { icon: <Rocket className="w-4 h-4" />, bg: "bg-blue-500/10 text-blue-500", title: "Created", sub: "New resource" };
    return { icon: <Terminal className="w-4 h-4" />, bg: "bg-muted text-muted-foreground", title: action, sub: "System action" };
  };

  const logs = (logsData?.data || []).map((log: any) => {
    const actionDetails = getActionDetails(log.action);
    const formatted = formatDateTime(log.createdAt);
    return {
      id: log.id,
      date: formatted.date,
      time: formatted.time,
      user: log.user?.name || "User",
      role: "Administrator",
      actionIcon: actionDetails.icon,
      actionBg: actionDetails.bg,
      actionTitle: actionDetails.title,
      actionSub: actionDetails.sub,
      targetIcon: log.project ? <Layers className="w-4 h-4" /> : <Box className="w-4 h-4" />,
      targetBg: log.project ? "bg-indigo-500/10 text-indigo-500" : "bg-blue-500/10 text-blue-500",
      targetTitle: log.project ? log.project.name : (log.description || "System"),
      targetSub: log.project ? "Project" : "Container / System",
      status: log.status || "Success",
      ip: log.ipAddress || "-",
    };
  });

  const totalPages = logsData?.totalPages || 1;
  const totalLogs = logsData?.total || 0;
  const startCount = totalLogs === 0 ? 0 : (currentPage - 1) * 15 + 1;
  const endCount = Math.min(currentPage * 15, totalLogs);
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
      
      <ActivityLogsFilter 
        search={search}
        setSearch={setSearch}
        actionFilter={actionFilter}
        setActionFilter={setActionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        date={date}
        setDate={setDate}
        setCurrentPage={setCurrentPage}
        handleExport={handleExport}
      />

      <ActivityLogsTable 
        logs={logs}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalLogs={totalLogs}
        startCount={startCount}
        endCount={endCount}
        setCurrentPage={setCurrentPage}
      />

    </div>
  );
}
