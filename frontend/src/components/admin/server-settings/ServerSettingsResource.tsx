"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChevronDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { AdminMonitoringHistoricalDto, AdminMonitoringOverviewDto } from "@/hooks/useAdminMonitoring";

interface ServerSettingsResourceProps {
  historical: AdminMonitoringHistoricalDto[];
  overview: AdminMonitoringOverviewDto;
  range: string;
  setRange: (r: string) => void;
}

export function ServerSettingsResource({ historical, overview, range, setRange }: ServerSettingsResourceProps) {
  // If historical is empty, provide a fallback to prevent chart crash
  const chartData = historical && historical.length > 0 ? historical : [
    { name: "No Data", cpu: 0, ram: 0, disk: 0 }
  ];

  const renderChart = (dataKey: string, color: string, gradientId: string, yAxisDomain: [number, number], yAxisTicks: number[], yAxisFormatter: (val: number) => string) => (
    <div className="h-[90px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
            dy={5}
            minTickGap={30}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} 
            domain={yAxisDomain}
            ticks={yAxisTicks}
            tickFormatter={yAxisFormatter}
          />
          <Area 
            type="linear" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={1.5}
            fillOpacity={1} 
            fill={`url(#${gradientId})`} 
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: "hsl(var(--background))", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-bold text-foreground">Resource Usage</h3>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 text-[12px] px-3 font-medium text-muted-foreground border-border bg-transparent gap-2" })}>
            {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setRange("24h")}>Last 24 Hours</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRange("7d")}>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRange("30d")}>Last 30 Days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col pt-2 pb-1 space-y-5">
        {/* CPU Chart */}
        <div>
          <h4 className="text-[13px] font-bold text-foreground mb-1">CPU Usage (%)</h4>
          {renderChart("cpu", "#3b82f6", "colorCpu", [0, 100], [0, 50, 100], (v) => `${v}%`)}
        </div>

        {/* RAM Chart */}
        <div>
          <h4 className="text-[13px] font-bold text-foreground mb-1">RAM Usage (GB)</h4>
          {renderChart("ram", "#10b981", "colorRam", [0, 16], [0, 8, 16], (v) => `${v} GB`)}
        </div>

        {/* Disk Chart */}
        <div>
          <h4 className="text-[13px] font-bold text-foreground mb-1">Disk Usage (%)</h4>
          {renderChart("disk", "#8b5cf6", "colorDisk", [0, 100], [0, 50, 100], (v) => `${v}%`)}
        </div>
      </div>
    </div>
  );
}

