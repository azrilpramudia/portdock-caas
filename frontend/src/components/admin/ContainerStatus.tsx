"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ContainerStatusSummaryDto } from "@/hooks/useAdminDashboard";

interface ContainerStatusProps {
  data?: ContainerStatusSummaryDto;
}

export function ContainerStatus({ data }: ContainerStatusProps) {
  const active = data?.active || 0;
  const stopped = data?.stopped || 0;
  const failed = data?.failed || 0;
  const total = active + stopped + failed;

  const getPercentage = (val: number) => total > 0 ? ((val / total) * 100).toFixed(1) : "0.0";

  const statusData = [
    { name: "Running", value: active, color: "#10B981", bgClass: "bg-emerald-500", percentage: getPercentage(active) },
    { name: "Stopped", value: stopped, color: "#F59E0B", bgClass: "bg-amber-500", percentage: getPercentage(stopped) },
    { name: "Failed/Error", value: failed, color: "#EF4444", bgClass: "bg-red-500", percentage: getPercentage(failed) },
  ];

  const totalContainers = total;

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-base font-bold text-foreground">Container Status</h3>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-1/2 relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 m-auto w-[90px] h-[90px] bg-card rounded-full flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-foreground leading-none">{total}</span>
            <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">Total</span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {statusData.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${stat.bgClass}`}></span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground/80">{stat.name}</span>
              </div>
              <div className="ml-auto text-right">
                <span className="text-sm font-bold text-foreground">{stat.value}</span>
                <span className="text-[11px] font-medium text-muted-foreground ml-1">({stat.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Link href="/admin/containers" className="text-sm font-bold text-primary hover:text-primary/80 inline-flex items-center transition-colors group">
          Lihat semua container <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
