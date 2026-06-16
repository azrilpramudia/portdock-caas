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
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Activity } from "lucide-react";

export default function ActivityLogsPage() {
  const logs: any[] = [];
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
              className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border text-foreground text-[14px] rounded-xl outline-none focus:border-blue-500 focus:bg-card transition-all font-medium placeholder:text-muted-foreground/70"
            />
            <Search className="w-4 h-4 text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Action Dropdown */}
          <div className="relative w-full sm:w-[180px]">
            <select className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer">
              <option>All Actions</option>
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="relative w-full sm:w-[260px]">
            <button className="w-full flex items-center justify-between bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 font-bold cursor-pointer hover:bg-muted transition-colors">
              <span>May 12, 2025 - May 18, 2025</span>
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-[160px]">
            <select className="w-full appearance-none bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer">
              <option>All Status</option>
            </select>
            <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-border/80 hover:bg-muted text-foreground rounded-xl text-[14px] font-bold transition-all whitespace-nowrap">
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
            {logs.length === 0 ? (
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
                      <Avatar className="w-8 h-8 rounded-full border border-border">
                        <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f1f5f9" />
                        <AvatarFallback className="text-[10px] font-bold">JD</AvatarFallback>
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
                      <div>
                        <div className="text-[13px] font-bold text-foreground">{log.actionTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{log.actionSub}</div>
                      </div>
                    </div>
                  </td>

                  {/* Project / Container */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${log.targetBg}`}>
                        {log.targetIcon}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-foreground">{log.targetTitle}</div>
                        <div className="text-[12px] font-medium text-muted-foreground mt-0.5">{log.targetSub}</div>
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
      <div className="flex items-center justify-between p-6 border-t border-border">
        <div className="text-[13px] font-medium text-muted-foreground">
          Showing 0 to 0 of 0 activities
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg font-bold text-[13px]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted font-medium text-[13px] transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted font-medium text-[13px] transition-colors">
            3
          </button>
          <span className="px-1 text-muted-foreground/70">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted font-medium text-[13px] transition-colors">
            6
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground/70 bg-card border border-border rounded-lg hover:bg-muted hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
