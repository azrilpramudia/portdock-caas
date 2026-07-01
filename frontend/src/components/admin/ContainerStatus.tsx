"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ContainerStatus() {
  const statusData = [
    { name: "Running", value: 76, color: "#10B981", bgClass: "bg-[#10B981]", percentage: "77.6" },
    { name: "Stopped", value: 18, color: "#F59E0B", bgClass: "bg-[#F59E0B]", percentage: "18.4" },
    { name: "Exited", value: 4, color: "#EF4444", bgClass: "bg-[#EF4444]", percentage: "4.1" },
  ];

  const total = statusData.reduce((sum, item) => sum + item.value, 0);

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
        <button className="text-sm font-bold text-primary hover:text-primary/80 flex items-center transition-colors">
          Lihat semua container <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
