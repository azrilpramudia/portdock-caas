"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export function ContainerStatus() {
  const data = [
    { name: "Running", value: 76, color: "#10B981" }, // Emerald 500
    { name: "Stopped", value: 18, color: "#F59E0B" }, // Amber 500
    { name: "Exited", value: 4, color: "#EF4444" },   // Red 500
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-bold text-gray-900 mb-6">Container Status</h3>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-1/2 relative h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</span>
          </div>
        </div>

        <div className="w-1/2 pl-8 space-y-4">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-sm font-medium text-gray-600">{item.name}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {item.value} <span className="text-xs text-gray-400 font-normal ml-1">({((item.value/total)*100).toFixed(1)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href="/admin/containers" className="inline-flex items-center text-sm font-semibold text-[#0066FF] hover:text-blue-700 transition-colors">
          Lihat semua container <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
