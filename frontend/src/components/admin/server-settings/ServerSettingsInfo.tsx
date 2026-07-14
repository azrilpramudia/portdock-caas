import React from "react";
import { Server, Shield, Monitor, RefreshCw, Box, Layers, Clock, Globe, Zap, Database, Terminal, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";

import { AdminMonitoringServerInfoDto } from "@/hooks/useAdminMonitoring";

interface ServerSettingsInfoProps {
  serverInfo: AdminMonitoringServerInfoDto;
}

export function ServerSettingsInfo({ serverInfo }: ServerSettingsInfoProps) {
  const infoList = [
    { label: "Server Name", value: serverInfo.name || "Unknown", icon: Server },
    { label: "IP Address", value: serverInfo.ip || "Unknown", icon: Globe, copy: true },
    { label: "Provider", value: serverInfo.provider || "Unknown", icon: Shield },
    { label: "OS", value: serverInfo.os || "Unknown", icon: Monitor },
    { label: "Kernel", value: serverInfo.kernel || "Unknown", icon: Terminal },
    { label: "Architecture", value: serverInfo.architecture || "Unknown", icon: Database },
    { label: "Docker Version", value: serverInfo.dockerVersion || "Unknown", icon: Box },
    { label: "Docker Compose", value: serverInfo.dockerCompose || "Unknown", icon: Layers },
    { label: "Uptime", value: serverInfo.uptime || "Unknown", icon: Clock },
    { label: "Timezone", value: serverInfo.timezone || "Unknown", icon: Globe },
    { label: "Last Reboot", value: serverInfo.lastReboot || "Unknown", icon: RefreshCw },
    { label: "Current Load", value: serverInfo.currentLoad || "Unknown", icon: Zap },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
        <h3 className="text-[15px] font-bold text-foreground mb-6">Server Information</h3>
        <div className="space-y-4">
          {infoList.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Icon className="w-4 h-4" />
                  <span className="text-[13px] font-semibold">{item.label}</span>
                </div>
                <div className="flex items-center justify-end relative">
                  <span className="text-[13px] font-medium text-foreground text-right">{item.value}</span>
                  {item.copy && (
                    <button className="absolute -right-6 text-muted-foreground/50 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
