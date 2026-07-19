"use client";

import React, { useState, useEffect } from 'react';
import "xterm/css/xterm.css";
import { 
  Server, 
  Box, 
  Globe,
  Settings,
  ChevronDown,
  Calendar,
  Loader2,
  Clock,
  Terminal as TerminalIcon,
  Download,
  FileText
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
import { useNginxLogsSession } from "@/hooks/useNginxLogsSession";
import { Button } from "@/components/ui/button";

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
          {/* Server Information */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-6">Server Information</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Server className="w-4 h-4" /> Server Name
                </div>
                <span className="font-semibold text-foreground">{data.serverInfo.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Globe className="w-4 h-4" /> IP Address
                </div>
                <span className="font-mono text-foreground">{data.serverInfo.ip}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Server className="w-4 h-4" /> Provider
                </div>
                <span className="font-semibold text-foreground">{data.serverInfo.provider}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Settings className="w-4 h-4" /> OS
                </div>
                <span className="font-semibold text-foreground">{data.serverInfo.os}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Box className="w-4 h-4" /> Docker Version
                </div>
                <span className="font-mono text-foreground">{data.serverInfo.dockerVersion}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Uptime
                </div>
                <span className="font-semibold text-foreground">{data.serverInfo.uptime}</span>
              </div>
            </div>
          </div>

          {/* Top Containers CPU */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-foreground">Top Containers by CPU</h3>
              <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">View all</span>
            </div>
            <div className="space-y-5">
              {data.topContainers.map((item, i) => {
                const colors = [
                  { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500' },
                  { bg: 'bg-indigo-500/10', text: 'text-indigo-500', fill: 'bg-indigo-500' },
                  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fill: 'bg-emerald-500' },
                  { bg: 'bg-amber-500/10', text: 'text-amber-500', fill: 'bg-amber-500' },
                  { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500' }
                ];
                const colorBase = colors[i % colors.length];
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${colorBase.bg} flex items-center justify-center flex-shrink-0`}>
                      <Box className={`w-5 h-5 ${colorBase.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="truncate pr-2">
                          <p className="text-sm font-bold text-foreground leading-none mb-1 truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-none truncate">{item.project}</p>
                        </div>
                        <span className="text-sm font-bold shrink-0">{item.cpu}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${colorBase.fill} rounded-full`} style={{ width: `${Math.min(100, item.cpu)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.topContainers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No containers running</p>
              )}
            </div>
          </div>

          {/* Top Containers RAM */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-foreground">Top Containers by RAM</h3>
              <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">View all</span>
            </div>
            <div className="space-y-5">
              {[...data.topContainers].sort((a, b) => b.ram - a.ram).map((item, i) => {
                const colors = [
                  { bg: 'bg-purple-500/10', text: 'text-purple-500', fill: 'bg-purple-500' },
                  { bg: 'bg-emerald-500/10', text: 'text-emerald-500', fill: 'bg-emerald-500' },
                  { bg: 'bg-sky-500/10', text: 'text-sky-500', fill: 'bg-sky-500' },
                  { bg: 'bg-orange-500/10', text: 'text-orange-500', fill: 'bg-orange-500' },
                  { bg: 'bg-blue-500/10', text: 'text-blue-500', fill: 'bg-blue-500' }
                ];
                const colorBase = colors[i % colors.length];
                return (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${colorBase.bg} flex items-center justify-center flex-shrink-0`}>
                      <Box className={`w-5 h-5 ${colorBase.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <div className="truncate pr-2">
                          <p className="text-sm font-bold text-foreground leading-none mb-1 truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground leading-none truncate">{item.project}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">{item.ram}%</p>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${colorBase.fill} rounded-full`} style={{ width: `${Math.min(100, item.ram)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {data.topContainers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No containers running</p>
              )}
            </div>
          </div>
        </div>

        <MonitoringServicesList services={data.services} />
      </div>

      <div className={activeTab === 'Nginx Logs' ? 'block space-y-4' : 'hidden'}>
          {/* Nginx Logs Controls */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-border bg-muted/30 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Nginx Log Viewer</h3>
                  <p className="text-xs text-muted-foreground">Real-time streaming from /var/log/nginx/</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Log Type Toggle */}
                <div className="flex bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => {
                      if (isNginxConnected) {
                        handleNginxConnect("error");
                      } else {
                        setNginxLogType("error");
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      nginxLogType === 'error' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Error Log
                  </button>
                  <button
                    onClick={() => {
                      if (isNginxConnected) {
                        handleNginxConnect("access");
                      } else {
                        setNginxLogType("access");
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      nginxLogType === 'access' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Access Log
                  </button>
                </div>

                {!isNginxConnected ? (
                  <Button size="sm" onClick={() => handleNginxConnect()} className="h-8 text-xs">
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={handleNginxDisconnect} className="h-8 text-xs">
                    Disconnect
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleNginxClear} className="h-8 text-xs">
                  Clear
                </Button>
                <Button size="sm" variant="outline" onClick={handleNginxDownload} className="h-8 text-xs">
                  <Download className="w-3.5 h-3.5 mr-1" /> Download
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-[#111827] p-4 overflow-hidden relative">
              <div ref={nginxTerminalRef} className="w-full h-full" />
              {!isNginxConnected && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                  <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                    <div>
                      <Button onClick={() => handleNginxConnect()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Connect to {nginxLogType === 'error' ? 'Error' : 'Access'} Log
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
