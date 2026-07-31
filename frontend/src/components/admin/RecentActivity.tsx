"use client";

import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { RecentActivityDto } from "@/hooks/useAdminDashboard";

interface RecentActivityProps {
  data?: RecentActivityDto[];
}

export function RecentActivity({ data }: RecentActivityProps) {
  const activities = data || [];

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full transition-colors">
      <h3 className="text-base font-bold text-foreground mb-6">Aktivitas Terbaru</h3>
      
      <div className="flex-1 space-y-6">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500 shadow-sm ring-4 ring-card">
                <Code className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-semibold text-foreground/90 leading-tight">
                  {act.action} - {act.project}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(act.time), { addSuffix: true, locale: id })} oleh {act.user}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <Link href="/admin/activity-logs" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          Lihat semua log aktivitas <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
