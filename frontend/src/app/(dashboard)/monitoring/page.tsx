"use client";

import { useState, useEffect } from "react";
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
  ArrowDown,
  ArrowRight
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
import { useQuery } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { monitoringService } from "@/services/monitoring.service";

type DataPoint = { time: string; value: number };
type AreaDataPoint = { time: string; cpu: number; ram: number };
type LogDataPoint = { time: string; cpu: number; ram: number; disk: number; network: number; up: number; down: number };

export default function MonitoringIndexPage() {
  const [selectedContainerId, setSelectedContainerId] = useState<string>("");
  const [isRealTime, setIsRealTime] = useState(true);
  
  const [cpuPercent, setCpuPercent] = useState(0);
  const [memUsageMb, setMemUsageMb] = useState(0);
  const [memLimitMb, setMemLimitMb] = useState(0);
  const [memPercent, setMemPercent] = useState(0);
  const [netRxMb, setNetRxMb] = useState(0);
  const [netTxMb, setNetTxMb] = useState(0);
  const [containerInfo, setContainerInfo] = useState<any>(null);

  const [sparklineDataCPU, setSparklineDataCPU] = useState<DataPoint[]>([]);
  const [sparklineDataRAM, setSparklineDataRAM] = useState<DataPoint[]>([]);
  const [sparklineDataNetwork, setSparklineDataNetwork] = useState<DataPoint[]>([]);
  const [areaChartData, setAreaChartData] = useState<AreaDataPoint[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogDataPoint[]>([]);

  const { data: containersData } = useQuery({
    queryKey: ["containers"],
    queryFn: () => containersService.getContainers(),
  });

  const containers = Array.isArray(containersData) ? containersData : (containersData?.data || []);

  useEffect(() => {
    if (containers.length > 0 && !selectedContainerId) {
      const running = containers.find((c: any) => c.status === "RUNNING");
      if (running) {
        setSelectedContainerId(running.id);
      } else {
        setSelectedContainerId(containers[0].id);
      }
    }
  }, [containers, selectedContainerId]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStats = async () => {
      if (!selectedContainerId) return;

      try {
        const stats = await monitoringService.getContainerStats(selectedContainerId);
        
        const timeStr = new Date(stats.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setCpuPercent(stats.cpuPercent || 0);
        setMemUsageMb(stats.memUsageMb || 0);
        setMemLimitMb(stats.memLimitMb || 0);
        setMemPercent(stats.memPercent || 0);
        setNetRxMb(stats.netRxMb || 0);
        setNetTxMb(stats.netTxMb || 0);
        setContainerInfo(stats);

        const newCpuPoint = { time: timeStr, value: stats.cpuPercent || 0 };
        const newRamPoint = { time: timeStr, value: stats.memPercent || 0 };
        const totalNet = parseFloat(((stats.netRxMb || 0) + (stats.netTxMb || 0)).toFixed(2));
        const newNetPoint = { time: timeStr, value: totalNet };
        
        const newAreaPoint = { time: timeStr, cpu: stats.cpuPercent || 0, ram: stats.memPercent || 0 };
        
        const newLog: LogDataPoint = { 
          time: timeStr, 
          cpu: stats.cpuPercent || 0, 
          ram: stats.memPercent || 0, 
          disk: 0, 
          network: totalNet,
          up: stats.netTxMb || 0,
          down: stats.netRxMb || 0
        };

        setSparklineDataCPU(prev => [...prev.slice(-20), newCpuPoint]);
        setSparklineDataRAM(prev => [...prev.slice(-20), newRamPoint]);
        setSparklineDataNetwork(prev => [...prev.slice(-20), newNetPoint]);
        setAreaChartData(prev => [...prev.slice(-30), newAreaPoint]);
        setRecentLogs(prev => [newLog, ...prev.slice(0, 9)]);

      } catch (err) {
        console.error("Failed to fetch container stats", err);
      }
    };

    if (isRealTime && selectedContainerId) {
      fetchStats();
      intervalId = setInterval(fetchStats, 3000);
    }

    return () => clearInterval(intervalId);
  }, [selectedContainerId, isRealTime]);

  const handleManualRefresh = () => {
    setSparklineDataCPU([]);
    setSparklineDataRAM([]);
    setSparklineDataNetwork([]);
    setAreaChartData([]);
    setRecentLogs([]);
  };

  const selectedContainerDetails = containers.find((c: any) => c.id === selectedContainerId);

  return (
    <div className="space-y-6">
      
      {/* 1. CONTROL HEADER */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-muted-foreground mb-2">Container Selection</p>
          <div className="relative w-full md:w-[320px]">
            <select 
              value={selectedContainerId} 
              onChange={(e) => {
                setSelectedContainerId(e.target.value);
                handleManualRefresh();
              }}
              className="flex items-center gap-2 w-full h-10 px-3 pr-10 text-[13px] font-bold text-foreground bg-card border border-border rounded-lg cursor-pointer hover:border-border/80 transition-colors appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="" disabled>Select Container</option>
              {containers.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-muted-foreground/70" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRealTime(!isRealTime)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-[13px] font-bold transition-colors ${
              isRealTime 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isRealTime ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            {isRealTime ? "Real-time" : "Paused"}
          </button>
          <button onClick={handleManualRefresh} className="w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. METRICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CPU */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-0.5">CPU Usage</p>
              <h3 className="text-2xl font-bold text-foreground leading-tight">{cpuPercent}%</h3>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">Real-time</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataCPU}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-0.5">RAM Usage</p>
              <h3 className="text-2xl font-bold text-foreground leading-tight">{memPercent}%</h3>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">{memUsageMb} MB / {memLimitMb} MB</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataRAM}>
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disk */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between opacity-60">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-0.5">Disk Usage</p>
              <h3 className="text-2xl font-bold text-foreground leading-tight">0%</h3>
              <p className="text-[11px] font-medium text-muted-foreground mt-1">N/A</p>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[]}>
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Network */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-0.5">Network (I/O)</p>
              <h3 className="text-2xl font-bold text-foreground leading-tight">{(netRxMb + netTxMb).toFixed(2)} MB</h3>
              <div className="flex items-center gap-2 mt-1 text-[11px] font-bold">
                <span className="flex items-center text-amber-500"><ArrowUp className="w-3 h-3 mr-0.5" /> {netTxMb.toFixed(2)}</span>
                <span className="flex items-center text-amber-500"><ArrowDown className="w-3 h-3 mr-0.5" /> {netRxMb.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="w-[80px] h-[40px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineDataNetwork}>
                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CPU Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-foreground">CPU Usage (Timeline)</h3>
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
                <Area type="monotone" dataKey="cpu" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM Chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-foreground">RAM Usage (Timeline)</h3>
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
                <Area type="monotone" dataKey="ram" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. BOTTOM PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Container Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-foreground mb-6">Container Information</h3>
          
          <div className="border border-border rounded-xl divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className={`w-4 h-4 ${containerInfo?.status === "RUNNING" ? "text-emerald-500" : "text-red-500"}`} />
                <span className="text-[13px] font-medium text-muted-foreground">Status</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                containerInfo?.status === "RUNNING" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              }`}>
                {containerInfo?.status || "Unknown"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Disc className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Image</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.imageName ? `${selectedContainerDetails.imageName}:${selectedContainerDetails.imageTag || 'latest'}` : "-"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Container ID</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">{selectedContainerDetails?.id || "-"}</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Port</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.hostPort ? (
                  <span className="flex items-center gap-1.5">
                    {selectedContainerDetails.hostPort}
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    {selectedContainerDetails.internalPort}
                  </span>
                ) : (selectedContainerDetails?.internalPort || "-")}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Created At</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.createdAt ? new Date(selectedContainerDetails.createdAt).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Resource Logs */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-foreground">Recent Resource Logs</h3>
          </div>
          
          <div className="overflow-x-auto border border-border rounded-xl max-h-[300px] overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-card sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground">
                  <th className="px-5 py-3.5 font-medium">Time</th>
                  <th className="px-5 py-3.5 font-medium text-center">CPU (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">RAM (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Disk (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Network (MB)</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-foreground divide-y divide-border">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="font-medium text-[13px]">Waiting for real-time data...</p>
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">{log.time}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.cpu}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.ram}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-muted-foreground">{log.disk} (N/A)</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="font-semibold">{log.network}</span>
                          <span className="text-[11px] font-medium text-muted-foreground/70">
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
