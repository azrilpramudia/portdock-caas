import React from "react";
import { Cpu, Server, HardDrive, Activity } from "lucide-react";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { DataPoint } from "@/hooks/useContainerMonitoring";

interface MonitoringStatsProps {
  cpuPercent: number;
  memPercent: number;
  memUsageMb: number;
  memLimitMb: number;
  netTxMb: number;
  netRxMb: number;
  sparklineDataCPU: DataPoint[];
  sparklineDataRAM: DataPoint[];
  sparklineDataNetwork: DataPoint[];
}

export function MonitoringStats({
  cpuPercent,
  memPercent,
  memUsageMb,
  memLimitMb,
  netTxMb,
  netRxMb,
  sparklineDataCPU,
  sparklineDataRAM,
  sparklineDataNetwork
}: MonitoringStatsProps) {
  return (
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
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
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
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={[]}>
              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-muted-foreground mb-0.5">Network I/O</p>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground leading-tight">{parseFloat((netRxMb + netTxMb).toFixed(2))}</h3>
              <span className="text-[11px] font-bold text-muted-foreground">MB</span>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">Total</p>
          </div>
        </div>
        <div className="w-[80px] h-[40px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={sparklineDataNetwork}>
              <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
