import React from "react";
import { Cpu, Server, HardDrive, Activity, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import { DataPoint } from "@/hooks/useContainerMonitoring";

interface MonitoringStatsProps {
  cpuPercent: number;
  memPercent: number;
  memUsageMb: number;
  memLimitMb: number;
  netTxMb: number;
  netRxMb: number;
  diskReadMb: number;
  diskWriteMb: number;
  sparklineDataCPU: DataPoint[];
  sparklineDataRAM: DataPoint[];
  sparklineDataNetwork: DataPoint[];
  sparklineDataDisk: DataPoint[];
}

export function MonitoringStats({
  cpuPercent,
  memPercent,
  memUsageMb,
  memLimitMb,
  netTxMb,
  netRxMb,
  diskReadMb,
  diskWriteMb,
  sparklineDataCPU,
  sparklineDataRAM,
  sparklineDataNetwork,
  sparklineDataDisk
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
            <p className="text-[12px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
              CPU Usage
              <TooltipProvider delay={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Penggunaan prosesor (CPU) secara real-time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
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
            <p className="text-[12px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
              RAM Usage
              <TooltipProvider delay={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Batas maksimal kontainer Anda adalah {memLimitMb} MB.<br/>Konsumsi mendekati 100% dapat menyebabkan aplikasi terhenti (OOM).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
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

      {/* Disk Usage */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
              Disk Usage
              <TooltipProvider delay={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Kecepatan baca (Read) dan tulis (Write) disk secara real-time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground leading-tight">{parseFloat((diskReadMb + diskWriteMb).toFixed(2))}</h3>
              <span className="text-[11px] font-bold text-muted-foreground">MB</span>
            </div>
            <p className="text-[11px] font-medium text-muted-foreground mt-1">Total</p>
          </div>
        </div>
        <div className="w-[80px] h-[40px]">
          <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
            <LineChart data={sparklineDataDisk}>
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
            <p className="text-[12px] font-medium text-muted-foreground mb-0.5 flex items-center gap-1">
              Network I/O
              <TooltipProvider delay={300}>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Total data jaringan yang masuk (RX) dan keluar (TX).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-foreground leading-tight">{parseFloat((netRxMb + netTxMb).toFixed(2))}</h3>
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
