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

const logs = [
  {
    id: 1,
    date: "May 18, 2025",
    time: "12:30:45 PM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Deploy Project",
    actionSub: "Deployed new version",
    actionIcon: <Rocket className="w-4 h-4 text-blue-600" />,
    actionBg: "bg-blue-50",
    targetTitle: "my-portfolio",
    targetSub: "Web Application",
    targetIcon: <Atom className="w-4 h-4 text-sky-500" />,
    targetBg: "bg-sky-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 2,
    date: "May 18, 2025",
    time: "12:28:12 PM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Start Container",
    actionSub: "Container started",
    actionIcon: <Box className="w-4 h-4 text-blue-600" />,
    actionBg: "bg-blue-50",
    targetTitle: "nginx-container",
    targetSub: "Container",
    targetIcon: <span className="font-bold text-[14px] text-emerald-600">N</span>,
    targetBg: "bg-emerald-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 3,
    date: "May 18, 2025",
    time: "12:20:33 PM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Connect GitHub",
    actionSub: "Repository connected",
    actionIcon: <GitBranch className="w-4 h-4 text-slate-800" />,
    actionBg: "bg-slate-100",
    targetTitle: "company-profile",
    targetSub: "Web Application",
    targetIcon: <Box className="w-4 h-4 text-emerald-600" />,
    targetBg: "bg-emerald-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 4,
    date: "May 18, 2025",
    time: "11:45:01 AM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Terminal Command",
    actionSub: "Executed command: docker ps",
    actionIcon: <Terminal className="w-4 h-4 text-slate-600" />,
    actionBg: "bg-slate-100",
    targetTitle: "my-portfolio",
    targetSub: "Container",
    targetIcon: <Box className="w-4 h-4 text-blue-600" />,
    targetBg: "bg-blue-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 5,
    date: "May 18, 2025",
    time: "11:30:22 AM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Restart Container",
    actionSub: "Container restarted",
    actionIcon: <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />,
    actionBg: "bg-emerald-50",
    targetTitle: "php-fpm",
    targetSub: "Container",
    targetIcon: <FileCode className="w-4 h-4 text-indigo-600" />,
    targetBg: "bg-indigo-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 6,
    date: "May 18, 2025",
    time: "10:15:18 AM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Stop Container",
    actionSub: "Container stopped",
    actionIcon: <Square className="w-4 h-4 text-red-500 fill-red-500" />,
    actionBg: "bg-red-50",
    targetTitle: "redis-db",
    targetSub: "Container",
    targetIcon: <Database className="w-4 h-4 text-red-600" />,
    targetBg: "bg-red-50",
    status: "Success",
    ip: "192.168.1.10"
  },
  {
    id: 7,
    date: "May 18, 2025",
    time: "09:10:05 AM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "Deploy Project",
    actionSub: "Deployment failed",
    actionIcon: <AlertTriangle className="w-4 h-4 text-orange-500" />,
    actionBg: "bg-orange-50",
    targetTitle: "ecommerce-app",
    targetSub: "Web Application",
    targetIcon: <Layers className="w-4 h-4 text-red-500" />,
    targetBg: "bg-red-50",
    status: "Failed",
    ip: "192.168.1.10"
  },
  {
    id: 8,
    date: "May 18, 2025",
    time: "08:22:47 AM",
    user: "John Doe",
    role: "Administrator",
    actionTitle: "User Login",
    actionSub: "User logged in",
    actionIcon: <Key className="w-4 h-4 text-emerald-600" />,
    actionBg: "bg-emerald-50",
    targetTitle: "System",
    targetSub: "Authentication",
    targetIcon: <Shield className="w-4 h-4 text-slate-600" />,
    targetBg: "bg-slate-100",
    status: "Success",
    ip: "192.168.1.10"
  }
];

export default function ActivityLogsPage() {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-144px)]">
      
      {/* 1. TOP FILTER BAR */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-6 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          
          {/* Search */}
          <div className="relative w-full sm:w-[280px]">
            <input 
              type="text" 
              placeholder="Search activities..." 
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-[14px] rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </div>

          {/* Action Dropdown */}
          <div className="relative w-full sm:w-[180px]">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer">
              <option>All Actions</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Picker */}
          <div className="relative w-full sm:w-[260px]">
            <button className="w-full flex items-center justify-between bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 font-bold cursor-pointer hover:bg-slate-50 transition-colors">
              <span>May 12, 2025 - May 18, 2025</span>
              <CalendarIcon className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-[160px]">
            <select className="w-full appearance-none bg-white border border-slate-200 text-slate-700 text-[14px] rounded-xl px-4 py-2.5 outline-none font-bold pr-10 cursor-pointer">
              <option>All Status</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

        {/* Export Button */}
        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-600 rounded-xl text-[14px] font-bold transition-all whitespace-nowrap">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* 2. MAIN TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
            <tr className="text-[12px] font-bold text-slate-500">
              <th className="px-6 py-4 font-semibold">Time</th>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Action</th>
              <th className="px-6 py-4 font-semibold">Project / Container</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">IP Address</th>
              <th className="px-6 py-4 font-semibold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                
                {/* Time */}
                <td className="px-6 py-4">
                  <div className="text-[13px] font-medium text-slate-600">{log.date}</div>
                  <div className="text-[12px] text-slate-400 mt-0.5">{log.time}</div>
                </td>

                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 rounded-full border border-slate-200">
                      <AvatarImage src="https://api.dicebear.com/7.x/notionists/svg?seed=John&backgroundColor=f1f5f9" />
                      <AvatarFallback className="text-[10px] font-bold">JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">{log.user}</div>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">{log.role}</div>
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
                      <div className="text-[13px] font-bold text-slate-800">{log.actionTitle}</div>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">{log.actionSub}</div>
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
                      <div className="text-[13px] font-bold text-slate-800">{log.targetTitle}</div>
                      <div className="text-[12px] font-medium text-slate-500 mt-0.5">{log.targetSub}</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {log.status === "Success" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[12px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[12px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Failed
                    </span>
                  )}
                </td>

                {/* IP Address */}
                <td className="px-6 py-4">
                  <span className="text-[13px] font-medium text-slate-600">{log.ip}</span>
                </td>

                {/* Actions (Three dots) */}
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION */}
      <div className="flex items-center justify-between p-6 border-t border-slate-100">
        <div className="text-[13px] font-medium text-slate-500">
          Showing 1 to 8 of 48 activities
        </div>
        <div className="flex items-center gap-1.5">
          <button className="w-8 h-8 flex items-center justify-center text-slate-400 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-blue-600 bg-blue-50 border border-blue-200 rounded-lg font-bold text-[13px]">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-[13px] transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-[13px] transition-colors">
            3
          </button>
          <span className="px-1 text-slate-400">...</span>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium text-[13px] transition-colors">
            6
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
