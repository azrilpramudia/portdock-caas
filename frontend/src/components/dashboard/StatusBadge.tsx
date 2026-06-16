"use client";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Running", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    INACTIVE: { label: "Stopped", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" },
    BUILDING: { label: "Building", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    FAILED: { label: "Failed", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
    DEPLOYED: { label: "Deployed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  };
  
  const s = statusMap[status] || { label: status, className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
  
  return (
    <Badge className={`text-[11px] font-semibold px-2.5 py-0.5 border shadow-none ${s.className}`}>
      {s.label}
    </Badge>
  );
}
