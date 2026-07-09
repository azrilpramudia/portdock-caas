"use client";

import React, { useState } from 'react';
import { 
  Cpu, 
  HardDrive, 
  ArrowUpRight, 
  Clock, 
  Server, 
  Box, 
  Globe,
  Settings,
  Lock,
  Wifi,
  ChevronDown,
  Calendar,
  Loader2
} from 'lucide-react';
import { FaMemory } from "react-icons/fa6";
import { SiNginx, SiPostgresql, SiRedis, SiDocker } from "react-icons/si";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAdminMonitoring } from '@/hooks/useAdmin';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminMonitoringPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [timeRange, setTimeRange] = useState('7d');
  const tabs = ['Overview', 'Server', 'Containers', 'Resources', 'Network', 'Storage', 'Alerts'];

  const { data, isLoading, isFetching } = useAdminMonitoring(timeRange);

  if (isLoading || !data) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Derive sparkline data from historical data for CPU and RAM
  const cpuSparkline = data.historical.map((d, i) => ({ name: i, value: d.cpu }));
  const ramSparkline = data.historical.map((d, i) => ({ name: i, value: d.ram }));
  // Flat lines for others since we don't track them historically
  const diskSparkline = Array.from({ length: 20 }, (_, i) => ({ name: i, value: data.overview.disk }));
  const networkSparkline = Array.from({ length: 20 }, (_, i) => ({ name: i, value: parseFloat(data.overview.network) || 0 }));
  const uptimeSparkline = Array.from({ length: 20 }, (_, i) => ({ name: i, value: 100 }));

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

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* CPU */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Cpu className="w-6 h-6 text-blue-600 dark:text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">CPU Usage</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{data.overview.cpu}%</h3>
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
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{data.overview.ram}%</h3>
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
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{data.overview.disk}%</h3>
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
              <h3 className="text-xl font-bold text-foreground mt-0.5 whitespace-nowrap">{data.overview.network}</h3>
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
              <h3 className="text-lg font-bold text-foreground mt-0.5 leading-tight">{data.overview.uptime}</h3>
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

      {/* Large Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">CPU Usage</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-sm bg-background cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-blue-500/20 outline-none">
                <span>
                  {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setTimeRange('24h')} className="cursor-pointer">Last 24 Hours</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('7d')} className="cursor-pointer">Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('30d')} className="cursor-pointer">Last 30 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.historical} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorCpu)" 
                  dot={{ r: 3, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RAM Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-foreground">RAM Usage</h3>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 border border-border px-3 py-1.5 rounded-lg text-sm bg-background cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-blue-500/20 outline-none">
                <span>
                  {timeRange === '24h' ? 'Last 24 Hours' : timeRange === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setTimeRange('24h')} className="cursor-pointer">Last 24 Hours</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('7d')} className="cursor-pointer">Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('30d')} className="cursor-pointer">Last 30 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.historical} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(val) => `${val} GB`} domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value: any) => [`${value} GB`, 'RAM']}
                />
                <Area 
                  type="monotone" 
                  dataKey="ram" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRam)" 
                  dot={{ r: 3, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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

      {/* System Services */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-6">System Services</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          
          {data.services.map((service, i) => {
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

    </div>
  );
}
