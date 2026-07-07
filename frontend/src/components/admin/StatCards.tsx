"use client";

import { Users, Folder, Box, Rocket, ArrowUp, ArrowDown } from "lucide-react";
import { AdminDashboardStatsDto } from "@/hooks/useAdmin";

interface StatCardsProps {
  data?: AdminDashboardStatsDto;
}

export function StatCards({ data }: StatCardsProps) {
  const stats = [
    {
      title: "Total Users",
      value: data?.totalUsers.toString() || "0",
      trend: `${Math.abs(data?.totalUsersTrend || 0)}%`,
      isPositive: (data?.totalUsersTrend || 0) >= 0,
      timeframe: "dari minggu lalu",
      icon: Users,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Total Projects",
      value: data?.totalProjects.toString() || "0",
      trend: `${Math.abs(data?.totalProjectsTrend || 0)}%`,
      isPositive: (data?.totalProjectsTrend || 0) >= 0,
      timeframe: "dari minggu lalu",
      icon: Folder,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Running Containers",
      value: data?.runningContainers.toString() || "0",
      trend: `${Math.abs(data?.activeDeploymentsTrend || 0)}%`,
      isPositive: (data?.activeDeploymentsTrend || 0) >= 0,
      timeframe: "dari minggu lalu",
      icon: Box,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "Total Containers",
      value: data?.totalContainers.toString() || "0",
      trend: `${Math.abs(data?.totalContainersTrend || 0)}%`,
      isPositive: (data?.totalContainersTrend || 0) >= 0,
      timeframe: "dari minggu lalu",
      icon: Box,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
      title: "Success Rate",
      value: `${data?.successRate || 100}%`,
      trend: `${Math.abs(data?.successRateTrend || 100)}%`,
      isPositive: (data?.successRateTrend || 100) >= 0,
      timeframe: "dari kemarin",
      icon: Rocket,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-card rounded-xl border border-border p-4 xl:p-5 shadow-sm flex items-start gap-3 xl:gap-4 h-full transition-colors">
            <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
              <Icon className={`w-6 h-6 xl:w-7 xl:h-7 ${stat.iconColor}`} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-[13px] xl:text-sm font-bold text-foreground mb-1 leading-tight">{stat.title}</p>
              <p className="text-2xl xl:text-3xl font-black text-foreground mb-1.5 leading-none">{stat.value}</p>
              <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
                <span className={`font-bold flex items-center shrink-0 ${stat.isPositive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded' : 'text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded'}`}>
                  {stat.isPositive ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
                  {stat.trend}
                </span>
                <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">{stat.timeframe}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
