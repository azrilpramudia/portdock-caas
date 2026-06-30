"use client";

import { Users, Folder, Box, Rocket, ArrowUp, ArrowDown } from "lucide-react";

export function StatCards() {
  const stats = [
    {
      title: "Total Users",
      value: "54",
      trend: "+8%",
      isPositive: true,
      timeframe: "dari minggu lalu",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      title: "Total Projects",
      value: "132",
      trend: "+12%",
      isPositive: true,
      timeframe: "dari minggu lalu",
      icon: Folder,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
    },
    {
      title: "Running Containers",
      value: "76",
      trend: "+5%",
      isPositive: true,
      timeframe: "dari minggu lalu",
      icon: Box,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50",
    },
    {
      title: "Total Containers",
      value: "98",
      trend: "+7%",
      isPositive: true,
      timeframe: "dari minggu lalu",
      icon: Box,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
    },
    {
      title: "Deployments Today",
      value: "24",
      trend: "+14%",
      isPositive: true,
      timeframe: "dari kemarin",
      icon: Rocket,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            
            <div className="flex items-center text-xs">
              <span className={`font-semibold flex items-center ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {stat.isPositive ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
                {stat.trend}
              </span>
              <span className="text-gray-500 ml-1.5">{stat.timeframe}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
