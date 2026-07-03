"use client";

import { Cpu, HardDrive, Network, MemoryStick } from "lucide-react";
import { ResourceUsageDto } from "@/hooks/useAdmin";

interface ResourceUsageProps {
  data?: ResourceUsageDto;
}

export function ResourceUsage({ data }: ResourceUsageProps) {
  // Assume Gigabit connection (1000 Mbps) for max capacity, which is ~125 MB/s
  const MAX_BANDWIDTH_MBPS = 125;
  const networkValue = parseFloat(data?.network || "0");
  const networkPercentage = Math.min(Math.round((networkValue / MAX_BANDWIDTH_MBPS) * 100), 100);

  const resources = [
    {
      name: "CPU Usage",
      percentage: data?.cpu || 0,
      label: `${data?.cpu || 0}%`,
      color: "bg-blue-500",
      icon: Cpu,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      name: "RAM Usage",
      percentage: data?.ram || 0,
      label: `${data?.ram || 0}%`,
      color: "bg-emerald-500",
      icon: MemoryStick,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      name: "Disk Usage",
      percentage: data?.disk || 0,
      label: `${data?.disk || 0}%`,
      color: "bg-purple-500",
      icon: HardDrive,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      name: "Network Traffic",
      percentage: networkPercentage,
      label: data?.network || "0 B/s",
      color: "bg-cyan-500",
      icon: Network,
      iconColor: "text-cyan-500",
      iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-base font-bold text-foreground">Resource Penggunaan Server</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Server: {typeof window !== 'undefined' ? window.location.hostname : 'portdock-server-01'}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between space-y-6">
        {resources.map((res, i) => {
          const Icon = res.icon;
          return (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${res.iconBg}`}>
                <Icon className={`w-5 h-5 ${res.iconColor}`} />
              </div>
              <div className="w-[140px] shrink-0">
                <span className="text-sm font-semibold text-foreground/80">{res.name}</span>
              </div>
              <div className="flex-1 flex items-center gap-4">
                <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${res.color}`} style={{ width: `${res.percentage}%` }}></div>
                </div>
                <div className="w-[40px] text-right shrink-0">
                  <span className="text-sm font-bold text-foreground">{res.percentage}%</span>
                </div>
              </div>
              <div className="w-[120px] text-right shrink-0">
                <span className="text-sm font-medium text-muted-foreground">{res.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
