import React from "react";
import { Server, Clock, Cpu, HardDrive, Database, Activity } from "lucide-react";

import { AdminMonitoringOverviewDto } from "@/hooks/useAdminMonitoring";

interface ServerSettingsStatsProps {
  overview: AdminMonitoringOverviewDto;
}

export function ServerSettingsStats({ overview }: ServerSettingsStatsProps) {
  const stats = [
    {
      title: "Server Status",
      value: "Online",
      subtext: "All systems operational",
      icon: Server,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      valueColor: "text-emerald-500",
    },
    {
      title: "Uptime",
      value: overview.uptime,
      subtext: "Since last reboot",
      icon: Clock,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      valueColor: "text-foreground",
    },
    {
      title: "CPU Usage",
      value: `${overview.cpu}%`,
      subtext: "Current load",
      icon: Cpu,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-600/10",
      valueColor: "text-foreground",
    },
    {
      title: "RAM Usage",
      value: `${overview.ram}%`,
      subtext: "Current memory usage",
      icon: Database,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      valueColor: "text-foreground",
    },
    {
      title: "Disk Usage",
      value: `${overview.disk}%`,
      subtext: "Main partition",
      icon: HardDrive,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      valueColor: "text-foreground",
    },
    {
      title: "Network Out",
      value: overview.network,
      subtext: "Current egress",
      icon: Activity,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      valueColor: "text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const hasProgressBar = ["CPU Usage", "RAM Usage", "Disk Usage"].includes(stat.title);
        
        return (
          <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-4 relative overflow-hidden flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-muted-foreground leading-tight">{stat.title}</p>
                <h3 className={`text-[16px] font-bold mt-1 tracking-tight leading-none ${stat.valueColor}`}>{stat.value}</h3>
              </div>
            </div>
            
            <div className="mt-auto pt-4">
              <p className="text-[11px] font-medium text-muted-foreground mb-1.5 leading-tight">{stat.subtext}</p>
              
              <div className="h-1 w-full mt-1">
                {stat.title === "CPU Usage" && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${overview.cpu}%` }}></div>
                  </div>
                )}
                {stat.title === "RAM Usage" && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${overview.ram}%` }}></div>
                  </div>
                )}
                {stat.title === "Disk Usage" && (
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${overview.disk}%` }}></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
