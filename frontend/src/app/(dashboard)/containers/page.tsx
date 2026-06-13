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
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Total Containers",
    value: "0",
    trend: "",
    trendUp: true,
    icon: Box,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Running",
    value: "0",
    trend: "",
    trendUp: true,
    icon: Play,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
  {
    title: "Stopped",
    value: "0",
    trend: "",
    trendUp: false,
    icon: Pause,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Failed",
    value: "0",
    trend: "",
    trendUp: false,
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

export default function ContainersPage() {
  const containers: any[] = [];
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
            className="w-full h-10 pl-9 pr-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="relative w-full sm:w-44">
          <select className="w-full h-10 px-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer transition-colors">
            <option>All Status</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative w-full sm:w-44">
          <select className="w-full h-10 px-4 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg appearance-none outline-none focus:border-blue-500 cursor-pointer transition-colors">
            <option>All Projects</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex-1 hidden sm:block" />

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button variant="outline" className="h-10 w-10 p-0 border-slate-200 text-slate-600 rounded-lg bg-white hover:bg-slate-50 transition-colors flex-shrink-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px] font-bold transition-all flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
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
              {containers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <Box className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">No containers found</p>
                  </td>
                </tr>
              ) : (
                containers.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <c.icon className={`w-8 h-8 ${c.iconColor}`} />
                        <div>
                          <p className="font-bold text-slate-900 text-[14px] leading-tight">{c.name}</p>
                          <p className="text-[12px] text-slate-500 mt-0.5">{c.id}</p>
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
                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200/60 bg-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {c.status === "Running" ? (
                          <>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200/60 bg-white">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 bg-red-50 transition-colors border border-red-100">
                              <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 bg-emerald-50 transition-colors border border-emerald-100">
                              <Play className="w-4 h-4 fill-current" />
                            </button>
                            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-100 bg-red-50 transition-colors border border-red-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border border-slate-200/60 bg-white">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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
          <p className="text-[13px] font-medium text-slate-500">Showing 0 to 0 of 0 containers</p>
          <div className="flex items-center gap-2">
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
      {containers.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 mt-8">
          {/* ... */}
        </div>
      )}

    </div>
  );
}
