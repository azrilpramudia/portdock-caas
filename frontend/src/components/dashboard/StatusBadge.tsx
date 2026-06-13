"use client";

import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Running", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    INACTIVE: { label: "Stopped", className: "bg-slate-100 text-slate-600 border-slate-200" },
    BUILDING: { label: "Building", className: "bg-amber-50 text-amber-600 border-amber-100" },
    FAILED: { label: "Failed", className: "bg-rose-50 text-rose-600 border-rose-100" },
    DEPLOYED: { label: "Deployed", className: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  };
  
  const s = statusMap[status] || { label: status, className: "bg-slate-100 text-slate-600 border-slate-200" };
  
  return (
    <Badge className={`text-[11px] font-semibold px-2.5 py-0.5 border shadow-none ${s.className}`}>
      {s.label}
    </Badge>
  );
}
