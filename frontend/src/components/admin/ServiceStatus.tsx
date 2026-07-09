"use client";

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { ServiceStatusDto } from "@/hooks/useAdminDashboard";

interface ServiceStatusProps {
  data?: ServiceStatusDto[];
}

export function ServiceStatus({ data }: ServiceStatusProps) {
  const services = data || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Active":
        return { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" };
      case "Down":
        return { icon: XCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" };
      default:
        return { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" };
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm transition-colors">
      <h3 className="text-base font-bold text-foreground mb-6">Status Layanan</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {services.map((srv, i) => {
          const config = getStatusConfig(srv.status);
          const Icon = config.icon;
          return (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bg}`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{srv.name}</p>
                <p className={`text-xs font-semibold ${config.color}`}>{srv.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
