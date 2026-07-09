import React from 'react';
import { Cpu, HardDrive, ArrowUpRight, Clock } from 'lucide-react';
import { FaMemory } from "react-icons/fa6";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AdminMonitoringOverviewDto } from "@/hooks/useAdminMonitoring";

interface MonitoringOverviewCardsProps {
  overview: AdminMonitoringOverviewDto;
  liveData: {cpu: number, ram: number, disk: number, network: number}[];
}

export function MonitoringOverviewCards({ overview, liveData }: MonitoringOverviewCardsProps) {
  // Fill the missing spots with 0 to always have a valid graph size at start
  const placeholderData = Array.from({ length: 20 - liveData.length }, (_, i) => ({ 
    name: `empty-${i}`, 
    value: 0 
  }));
  
  const createSparkline = (key: 'cpu' | 'ram' | 'disk' | 'network') => {
    return [
      ...placeholderData, 
      ...liveData.map((d, i) => ({ name: `live-${i}`, value: d[key] }))
    ];
  };

  const cpuSparkline = createSparkline('cpu');
  const ramSparkline = createSparkline('ram');
  const diskSparkline = createSparkline('disk');
  const networkSparkline = createSparkline('network');
  const uptimeSparkline = Array.from({ length: 20 }, (_, i) => ({ name: i, value: 100 }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* CPU */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">CPU Usage</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{overview.cpu}%</h3>
            <p className="text-xs text-muted-foreground mt-1">System Load</p>
          </div>
        </div>
        <div className="h-12 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cpuSparkline}>
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RAM */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <FaMemory className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">RAM Usage</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{overview.ram}%</h3>
            <p className="text-xs text-muted-foreground mt-1">System Memory</p>
          </div>
        </div>
        <div className="h-12 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ramSparkline}>
              <Line type="monotone" dataKey="value" stroke="#059669" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disk */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Disk Usage</p>
            <h3 className="text-2xl font-bold text-foreground mt-0.5">{overview.disk}%</h3>
            <p className="text-xs text-muted-foreground mt-1">Main Partition</p>
          </div>
        </div>
        <div className="h-12 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={diskSparkline}>
              <Line type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Network */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-6 h-6 text-sky-600 dark:text-sky-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Network (Out)</p>
            <h3 className="text-xl font-bold text-foreground mt-0.5 whitespace-nowrap">{overview.network}</h3>
            <p className="text-xs text-muted-foreground mt-1">Throughput</p>
          </div>
        </div>
        <div className="h-12 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={networkSparkline}>
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Uptime */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Uptime</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5 leading-tight">{overview.uptime}</h3>
          </div>
        </div>
        <div className="h-12 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={uptimeSparkline}>
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
