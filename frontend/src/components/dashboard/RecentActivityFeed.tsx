"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function RecentActivityFeed({ activities }: { activities?: any[] }) {
  const recentActivities = activities || [];
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden mt-6">
      <CardHeader className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-slate-900">
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
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Activity className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentActivities.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-4 w-1/3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.actionBg}`}>
                    {log.actionIcon}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">{log.actionTitle}</p>
                    <p className="text-[11.5px] text-slate-500 mt-0.5">by {log.user}</p>
                  </div>
                </div>
                <div className="w-1/6 text-[13px] font-bold text-blue-600">
                  {log.actionSub}
                </div>
                <div className="w-1/6 text-[12px] text-slate-500 font-medium">
                  {log.time}
                </div>
                <div className="w-1/6 text-right">
                  {log.status === "Success" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Failed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
