"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

import { ActivityLog } from "@/types";

export function RecentActivityFeed({ activities }: { activities?: ActivityLog[] }) {
  const recentActivities = activities || [];
  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden mt-6">
      <CardHeader className="px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-foreground">
            Recent Activity
          </CardTitle>
          <Link
            href="/activity-logs"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {recentActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Activity className="w-10 h-10 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentActivities.map((log) => {
              let icon = <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />;
              let bg = "bg-gray-500/10";
              let title = log.action.replace(/_/g, " ");
              let isSuccess = !log.action.includes("FAILED") && !log.action.includes("ERROR");

              const act = log.action.toUpperCase();
              if (act.includes("PROJECT")) {
                icon = <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
                bg = "bg-blue-500/10";
              } else if (act.includes("DEPLOYMENT")) {
                icon = <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
                bg = "bg-indigo-500/10";
              } else if (act.includes("CONTAINER")) {
                icon = <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
                bg = "bg-emerald-500/10";
              } else if (act.includes("DATABASE")) {
                icon = <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
                bg = "bg-amber-500/10";
              }

              return (
              <div key={log.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors group">
                <div className="flex items-center gap-4 w-1/3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground capitalize">{title.toLowerCase()}</p>
                    <p className="text-[11.5px] text-muted-foreground mt-0.5">by You</p>
                  </div>
                </div>
                <div className="w-1/6 text-[13px] font-bold text-blue-600 dark:text-blue-400">
                  {log.project?.name || log.description || "-"}
                </div>
                <div className="w-1/6 text-[12px] text-muted-foreground font-medium">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="w-1/6 text-right">
                  {isSuccess ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Failed
                    </span>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
