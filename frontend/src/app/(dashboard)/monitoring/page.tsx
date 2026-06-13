"use client";

import { 
  ChevronDown, 
  RefreshCw, 
  Cpu, 
  Server, 
  HardDrive, 
  Activity,
  CheckCircle2,
  Disc,
  Hash,
  Clock,
  Link2,
  Calendar,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

// --- MOCK DATA ---

const sparklineDataCPU: any[] = [];
const sparklineDataRAM: any[] = [];
const sparklineDataDisk: any[] = [];
const sparklineDataNetwork: any[] = [];
const areaChartData: any[] = [];
const recentLogs: any[] = [];

export default function MonitoringIndexPage() {
  return (
    <div className="space-y-6">
      
      {/* 1. CONTROL HEADER */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-slate-500 mb-2">Container Selection</p>
          <div className="relative w-full md:w-[320px]">
            <div className="flex items-center gap-2 w-full h-10 px-3 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="flex-1 text-slate-400">Select Container</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-600 text-[13px] font-bold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Real-time
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="relative w-[140px]">
            <div className="flex items-center justify-between w-full h-10 px-3 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 transition-colors">
              <span>Last 1 hour</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CPU */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-0.5">CPU Usage</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">0%</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">0 / 0 CPU</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataCPU}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-0.5">RAM Usage</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">0%</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">0 MB / 0 GB</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataRAM}>
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-0.5">Disk Usage</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">0%</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">0 GB / 0 GB</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataDisk}>
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-0.5">Network Usage</p>
              <h3 className="text-2xl font-bold text-slate-900 leading-tight">0 Mbps</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold">
                <span className="flex items-center text-amber-500"><ArrowUp className="w-3 h-3 mr-0.5" /> 0 Mbps</span>
                <span className="flex items-center text-amber-500"><ArrowDown className="w-3 h-3 mr-0.5" /> 0 Mbps</span>
              </div>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataNetwork}>
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CPU Chart */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-slate-900">CPU Usage</h3>
            <div className="flex items-center justify-between w-[120px] h-9 px-3 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer">
              <span>Percentage</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM Chart */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-slate-900">RAM Usage</h3>
            <div className="flex items-center justify-between w-[120px] h-9 px-3 text-[12px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer">
              <span>Percentage</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `${val}%`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Container Information */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6">Container Information</h3>
          
          <div className="border border-slate-100 rounded-xl divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[13px] font-medium text-slate-600">Status</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">
                Unknown
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Disc className="w-4 h-4" />
                <span className="text-[13px] font-medium text-slate-600">Image</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700">-</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Hash className="w-4 h-4" />
                <span className="text-[13px] font-medium text-slate-600">Container ID</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700">-</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="w-4 h-4" />
                <span className="text-[13px] font-medium text-slate-600">Uptime</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700">-</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Link2 className="w-4 h-4" />
                <span className="text-[13px] font-medium text-slate-600">Port</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700">-</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-4 h-4" />
                <span className="text-[13px] font-medium text-slate-600">Created At</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700">-</span>
            </div>
          </div>
        </div>

        {/* Recent Resource Logs */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm overflow-hidden">
          <h3 className="text-[15px] font-bold text-slate-900 mb-6">Recent Resource Logs</h3>
          
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr className="border-b border-slate-100 text-[12px] font-semibold text-slate-500">
                  <th className="px-5 py-3.5 font-medium">Time</th>
                  <th className="px-5 py-3.5 font-medium text-center">CPU (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">RAM (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Disk (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Network (Mbps)</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-slate-700 divide-y divide-slate-50/80">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      <Activity className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium text-[13px]">No recent logs</p>
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{log.time}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.cpu}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.ram}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.disk}</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-semibold">{log.network}</span>
                          <span className="text-[11px] font-medium text-slate-400">
                            (↑{log.up} / ↓{log.down})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
