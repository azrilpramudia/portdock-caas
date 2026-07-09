import React from 'react';
import { ChevronDown } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminMonitoringHistoricalDto } from "@/hooks/useAdminMonitoring";

interface MonitoringHistoricalChartsProps {
  historicalData: AdminMonitoringHistoricalDto[];
  timeRange: string;
  setTimeRange: (range: string) => void;
}

export function MonitoringHistoricalCharts({ historicalData, timeRange, setTimeRange }: MonitoringHistoricalChartsProps) {
  return (
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
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: any) => [`${value}%`, 'RAM']}
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
  );
}
