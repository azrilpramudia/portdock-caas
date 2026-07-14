import React from "react";
import { Box, Server as ServerIcon, Database, Layers, Lock, ShieldCheck, ActivitySquare, Folder } from "lucide-react";

import { AdminMonitoringServiceDto } from "@/hooks/useAdminMonitoring";

interface ServerSettingsServicesProps {
  services: AdminMonitoringServiceDto[];
}

const iconMap: Record<string, { icon: any; color: string }> = {
  "Docker Engine": { icon: Box, color: "text-blue-500" },
  "Nginx": { icon: ServerIcon, color: "text-emerald-500" },
  "PostgreSQL": { icon: Database, color: "text-blue-400" },
  "SSL (Let's Encrypt)": { icon: Lock, color: "text-slate-600 dark:text-slate-400" },
  "Web Socket": { icon: ActivitySquare, color: "text-purple-500" },
  "Firewall (UFW)": { icon: ShieldCheck, color: "text-orange-500" },
};

export function ServerSettingsServices({ services }: ServerSettingsServicesProps) {



  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full">
        <h3 className="text-[15px] font-bold text-foreground mb-6">Services Status</h3>
        <div className="space-y-4">
          {services.map((service, idx) => {
            const iconData = iconMap[service.name] || { icon: ServerIcon, color: "text-foreground" };
            const Icon = iconData.icon;
            const isRunning = service.status === "Active";
            const isWarning = service.status === "Warning";
            
            return (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${iconData.color}`} />
                  <span className="text-[13px] font-bold text-foreground">{service.name}</span>
                </div>
                <div className="flex items-center gap-6">
                  {isRunning ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {service.status}
                    </span>
                  ) : isWarning ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      {service.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-0.5 rounded-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {service.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
