import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AreaDataPoint } from "@/hooks/useContainerMonitoring";

interface MonitoringChartsProps {
  title: string;
  dataKey: "cpu" | "ram";
  color: string;
  gradientId: string;
  areaChartData: AreaDataPoint[];
}

export function MonitoringCharts({ title, dataKey, color, gradientId, areaChartData }: MonitoringChartsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-[15px] font-bold text-foreground mb-6">{title}</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              width={55}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "var(--card)", 
                borderColor: "var(--border)",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "13px",
                fontWeight: 500
              }}
              itemStyle={{ color: "var(--foreground)" }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              name={dataKey === "cpu" ? "CPU %" : "RAM %"} 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#${gradientId})`} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
