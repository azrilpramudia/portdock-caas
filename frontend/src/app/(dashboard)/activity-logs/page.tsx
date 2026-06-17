"use client";

import { 
  Search,
  ChevronDown,
  Calendar as CalendarIcon,
  Download,
  MoreHorizontal,
  Rocket,
  Box,
  GitBranch,
  Terminal,
  Play,
  Square,
  AlertTriangle,
  Key,
  Atom,
  Server,
  FileCode,
  Database,
  Layers,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Activity } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { useState } from "react";
import { format } from "date-fns";

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
    return {
      id: log.id,
      date: format(new Date(log.createdAt), "MMM dd, yyyy"),
      time: format(new Date(log.createdAt), "HH:mm:ss"),
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
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-144px)]">
      
      {/* 1. TOP FILTER BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-6 border-b border-border">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          
          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <input 
              type="text" 
              placeholder="Search activities..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border text-foreground text-[14px] rounded-xl outline-none focus:border-blue-500 focus:bg-card transition-all font-medium placeholder:text-muted-foreground/70"
            />
            <Search className="w-4 h-4 text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Action Dropdown */}
          <div className="relative w-full sm:w-[180px]">
            <select 
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer"
            >
              <option value="All Actions">All Actions</option>
              <option value="Start">Started</option>
              <option value="Stop">Stopped</option>
              <option value="Create">Created</option>
              <option value="Delete">Deleted</option>
              <option value="Deploy">Deployed</option>
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="relative w-full sm:w-[260px] xl:w-[280px]">
            <Popover>
              <PopoverTrigger className="w-full flex items-center justify-between bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 font-bold cursor-pointer hover:bg-muted transition-colors">
                <span className="truncate">
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span className="text-muted-foreground/80 font-medium">Pick a date range</span>
                    )}
                  </span>
                <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setCurrentPage(1);
                  }}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-[160px]">
            <select 
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

        {/* Export Button */}
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-border/80 hover:bg-muted text-foreground rounded-xl text-[14px] font-bold transition-all whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* 2. MAIN TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-card sticky top-0 z-10 border-b border-border">
            <tr className="text-[12px] font-bold text-muted-foreground">
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Project / Container</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">IP Address</th>
              <th className="px-6 py-4 font-semibold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
                  <p className="font-medium text-sm">Loading activity logs...</p>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="font-medium text-sm">No activity logs found</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/50 transition-colors group">
                  
                  {/* Time */}
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-muted-foreground">{log.date}</div>
                    <div className="text-[12px] text-muted-foreground/70 mt-0.5">{log.time}</div>
                  </td>

                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-foreground">
                          {log.user.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                        </span>
                      </Avatar>
                      <div>
                        <div className="text-[13px] font-bold text-foreground">{log.user}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{log.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.actionBg}`}>
                        {log.actionIcon}
                      </div>
                      <div className="max-w-[200px] xl:max-w-[250px]">
                        <div className="text-[13px] font-bold text-foreground truncate">{log.actionTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">{log.actionSub}</div>
                      </div>
                    </div>
                  </td>

                  {/* Project / Container */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.targetBg}`}>
                        {log.targetIcon}
                      </div>
                      <div className="max-w-[200px] xl:max-w-[250px]">
                        <div className="text-[13px] font-bold text-foreground truncate">{log.targetTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">{log.targetSub}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {log.status === "Success" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Success
                      </span>
                    ) : log.status === "Pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[12px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Failed
                      </span>
                    )}
                  </td>

                  {/* IP Address */}
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-medium text-muted-foreground">{log.ip}</span>
                  </td>

                  {/* Actions (Three dots) */}
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-muted-foreground/70 hover:text-foreground rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-[13px] font-medium text-muted-foreground">
            Showing {startCount} to {endCount} of {totalLogs} activities
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-bold text-foreground mx-2">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
