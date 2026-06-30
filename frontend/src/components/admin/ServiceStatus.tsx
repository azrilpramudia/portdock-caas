"use client";

import { Box, Server, Database, Lock, Wifi } from "lucide-react";

export function ServiceStatus() {
  const services = [
    { name: "Docker Engine", status: "Active", icon: Box, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
    { name: "Nginx", status: "Active", icon: Server, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
    { name: "PostgreSQL", status: "Active", icon: Database, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { name: "SSL (Let's Encrypt)", status: "Active", icon: Lock, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
    { name: "Web Socket", status: "Active", icon: Wifi, iconColor: "text-blue-500", iconBg: "bg-blue-50" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-base font-bold text-gray-900 mb-6">Status Layanan</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {services.map((srv, i) => {
          const Icon = srv.icon;
          return (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${srv.iconBg}`}>
                <Icon className={`w-5 h-5 ${srv.iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{srv.name}</p>
                <p className="text-xs font-semibold text-emerald-500">{srv.status}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
