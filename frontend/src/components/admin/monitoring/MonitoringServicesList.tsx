import React from 'react';
import { Server, Lock, Wifi } from 'lucide-react';
import { SiNginx, SiPostgresql, SiRedis, SiDocker } from "react-icons/si";
import { AdminMonitoringServiceDto } from "@/hooks/useAdminMonitoring";

interface MonitoringServicesListProps {
  services: AdminMonitoringServiceDto[];
}

export function MonitoringServicesList({ services }: MonitoringServicesListProps) {
  // Helper to get service icon
  const getServiceIcon = (name: string, className: string) => {
    switch (name.toLowerCase()) {
      case 'docker engine': return <SiDocker className={className} />;
      case 'nginx': return <SiNginx className={className} />;
      case 'postgresql': return <SiPostgresql className={className} />;
      case 'redis': return <SiRedis className={className} />;
      case 'ssl (let\'s encrypt)': return <Lock className={className} />;
      case 'web socket': return <Wifi className={className} />;
      default: return <Server className={className} />;
    }
  };

  // Helper to get service color classes
  const getServiceColors = (name: string) => {
    switch (name.toLowerCase()) {
      case 'docker engine': return { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-500' };
      case 'nginx': return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-500' };
      case 'postgresql': return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' };
      case 'redis': return { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-500' };
      case 'ssl (let\'s encrypt)': return { bg: 'bg-slate-500/10', text: 'text-blue-800 dark:text-blue-400' };
      case 'web socket': return { bg: 'bg-blue-500/10', text: 'text-blue-500 dark:text-blue-400' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-6">System Services</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {services.map((service, i) => {
          const colors = getServiceColors(service.name);
          const statusColor = service.status === 'Active' ? 'bg-emerald-500' : service.status === 'Warning' ? 'bg-amber-500' : 'bg-red-500';
          const statusTextColor = service.status === 'Active' ? 'text-emerald-500' : service.status === 'Warning' ? 'text-amber-500' : 'text-red-500';
          
          return (
            <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-xl bg-background shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-2xl ${colors.bg} flex items-center justify-center shrink-0`}>
                {getServiceIcon(service.name, `w-5 h-5 ${colors.text}`)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-foreground leading-tight truncate">{service.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
                  <span className={`text-[11px] ${statusTextColor} font-semibold truncate`}>
                    {service.name === 'SSL (Let\'s Encrypt)' && service.status === 'Active' ? 'Active' : service.status === 'Active' ? 'Running' : service.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
