"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
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
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="px-6 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
            Resource Usage
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] text-slate-500 font-medium">Live</span>
            </div>
            <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-semibold text-slate-600 border-slate-200">
              All Containers <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        
        <div className="flex justify-between items-end mb-6 shrink-0">
          <div className="flex gap-6">
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> CPU
              </p>
              <p className="text-2xl font-bold text-slate-800 leading-none">{chartData.length ? chartData[chartData.length - 1]?.cpu : 0}<span className="text-lg text-slate-400">%</span></p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-slate-500 mb-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> RAM
              </p>
              <p className="text-2xl font-bold text-slate-800 leading-none">{chartData.length ? chartData[chartData.length - 1]?.ram : 0}<span className="text-lg text-slate-400">%</span></p>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-[160px] w-full mt-auto">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Activity className="w-8 h-8 mb-2 text-slate-300" />
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
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
