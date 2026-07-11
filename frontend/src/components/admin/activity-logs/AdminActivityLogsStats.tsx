import React from "react";
import { ClipboardList, User, Server, Rocket, ShieldAlert, ArrowUp, ArrowDown } from "lucide-react";

interface AdminActivityLogsStatsProps {
  stats: any;
}

export function AdminActivityLogsStats({ stats }: AdminActivityLogsStatsProps) {
  const statCards = [
    { title: "Total Activities", value: stats?.totalActivities || 0, trend: stats?.totalActivitiesTrend || "0%", isPositive: true, timeframe: "dari minggu lalu", icon: ClipboardList, iconColor: "text-blue-500", iconBg: "bg-blue-50 dark:bg-blue-500/10" },
    { title: "User Activities", value: stats?.userActivities || 0, trend: stats?.userActivitiesTrend || "0%", isPositive: true, timeframe: "dari minggu lalu", icon: User, iconColor: "text-emerald-500", iconBg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { title: "System Activities", value: stats?.systemActivities || 0, trend: stats?.systemActivitiesTrend || "0%", isPositive: true, timeframe: "dari minggu lalu", icon: Server, iconColor: "text-purple-500", iconBg: "bg-purple-50 dark:bg-purple-500/10" },
    { title: "Deployment Activities", value: stats?.deploymentActivities || 0, trend: stats?.deploymentActivitiesTrend || "0%", isPositive: true, timeframe: "dari minggu lalu", icon: Rocket, iconColor: "text-orange-500", iconBg: "bg-orange-50 dark:bg-orange-500/10" },
    { title: "Security Activities", value: stats?.securityActivities || 0, trend: stats?.securityActivitiesTrend || "0%", isPositive: true, timeframe: "dari minggu lalu", icon: ShieldAlert, iconColor: "text-red-500", iconBg: "bg-red-50 dark:bg-red-500/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-card rounded-xl border border-border shadow-sm flex items-start gap-4 p-6 transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
              <Icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
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
