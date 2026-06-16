"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

export function ResourceUsageChart({ data }: { data?: any[] }) {
  const chartData = data || [];
  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
            Resource Usage
          </CardTitle>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md outline-none bg-background hover:bg-muted h-7 px-2 text-[11px] font-semibold text-muted-foreground border border-border shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50">
                All Containers <ChevronDown className="w-3 h-3 ml-1 text-muted-foreground/50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="text-xs cursor-pointer">All Containers</DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer">Web Frontend</DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer">API Backend</DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer">Database Cache</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        
        <div className="flex justify-between items-end mb-6 shrink-0">
          <div className="flex gap-6">
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> CPU
              </p>
              <p className="text-2xl font-bold text-foreground leading-none">{chartData.length ? chartData[chartData.length - 1]?.cpu : 0}<span className="text-lg text-muted-foreground">%</span></p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> RAM
              </p>
              <p className="text-2xl font-bold text-foreground leading-none">{chartData.length ? chartData[chartData.length - 1]?.ram : 0}<span className="text-lg text-muted-foreground">%</span></p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[160px] w-full mt-auto">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Activity className="w-8 h-8 mb-2 text-muted-foreground/30" />
              <p className="text-xs font-medium">No resource data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCpu)" />
                <Area type="monotone" dataKey="ram" name="RAM (%)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRam)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
