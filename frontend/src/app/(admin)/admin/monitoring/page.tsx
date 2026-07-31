"use client";

import React, { useState, useEffect } from 'react';
import "xterm/css/xterm.css";
import { 
  Box, 
  ChevronDown,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAdminMonitoring } from "@/hooks/useAdminMonitoring";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MonitoringOverviewCards } from "@/components/admin/monitoring/MonitoringOverviewCards";
import { MonitoringHistoricalCharts } from "@/components/admin/monitoring/MonitoringHistoricalCharts";
import { MonitoringServicesList } from "@/components/admin/monitoring/MonitoringServicesList";
import { ServerInfoPanel } from "@/components/admin/monitoring/ServerInfoPanel";
import { TopContainersPanel } from "@/components/admin/monitoring/TopContainersPanel";
import { NginxLogsTerminal } from "@/components/admin/monitoring/NginxLogsTerminal";
import { useNginxLogsSession } from "@/hooks/useNginxLogsSession";

export default function AdminMonitoringPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('7d');
  const tabs = ['Overview', 'Nginx Logs', 'Server', 'Containers', 'Resources', 'Network', 'Storage', 'Alerts'];

  const {
    terminalRef: nginxTerminalRef,
    isConnected: isNginxConnected,
    logType: nginxLogType,
    setLogType: setNginxLogType,
    handleConnect: handleNginxConnect,
    handleDisconnect: handleNginxDisconnect,
    handleClear: handleNginxClear,
    handleDownload: handleNginxDownload,
    fitTerminal: fitNginxTerminal,
  } = useNginxLogsSession();

  useEffect(() => {
    if (activeTab === 'Nginx Logs') {
      fitNginxTerminal();
    }
  }, [activeTab]);

  const { data, isLoading } = useAdminMonitoring(timeRange);

  const [liveData, setLiveData] = useState<{cpu: number, ram: number, disk: number, network: number}[]>([]);

  useEffect(() => {
    if (data?.overview) {
      setLiveData(prev => {
        const netValue = parseFloat(data.overview.network) || 0;
        const newData = [...prev, { 
          cpu: data.overview.cpu, 
          ram: data.overview.ram, 
          disk: data.overview.disk, 
          network: netValue 
        }];
        if (newData.length > 20) {
          return newData.slice(newData.length - 20);
        }
        return newData;
      });
    }
  }, [data?.overview]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Monitoring</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-foreground">Monitoring</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-lg shadow-sm cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-blue-500/20 outline-none">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            </span>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setTimeRange('24h')} className="cursor-pointer">Last 24 Hours</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange('7d')} className="cursor-pointer">Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange('30d')} className="cursor-pointer">Last 30 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-border overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors whitespace-nowrap relative ${
              activeTab === tab 
                ? 'text-blue-600 dark:text-blue-500' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className={activeTab === 'Overview' ? 'block space-y-6' : 'hidden'}>
        <MonitoringOverviewCards overview={data.overview} liveData={liveData} />
        
        <MonitoringHistoricalCharts historicalData={data.historical} timeRange={timeRange} setTimeRange={setTimeRange} />

        {/* Info Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ServerInfoPanel data={data.serverInfo} />
          <TopContainersPanel topContainers={data.topContainers} />
        </div>

        <MonitoringServicesList services={data.services} />
      </div>

      <div className={activeTab === 'Nginx Logs' ? 'block space-y-4' : 'hidden'}>
        <NginxLogsTerminal 
          nginxTerminalRef={nginxTerminalRef as any}
          isNginxConnected={isNginxConnected}
          nginxLogType={nginxLogType}
          setNginxLogType={setNginxLogType}
          handleNginxConnect={handleNginxConnect}
          handleNginxDisconnect={handleNginxDisconnect}
          handleNginxClear={handleNginxClear}
          handleNginxDownload={handleNginxDownload}
        />
      </div>

      {activeTab !== 'Overview' && activeTab !== 'Nginx Logs' && (
        <div className="flex flex-col items-center justify-center py-24 mt-6 text-center bg-card border border-border rounded-xl shadow-sm">
          <Box className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">{activeTab}</h2>
          <p className="text-muted-foreground max-w-md">
            This feature is currently in development (Coming Soon). 
            We are working hard to bring you more detailed {activeTab.toLowerCase()} monitoring.
          </p>
        </div>
      )}

    </div>
  );
}
