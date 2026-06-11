import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    INACTIVE: "bg-slate-100 text-slate-600 border-slate-200",
    BUILDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
    FAILED: "bg-red-100 text-red-700 border-red-200",
    RUNNING: "bg-green-100 text-green-700 border-green-200",
    STOPPED: "bg-slate-100 text-slate-600 border-slate-200",
    EXITED: "bg-red-100 text-red-700 border-red-200",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Aktif", INACTIVE: "Tidak Aktif", BUILDING: "Building", FAILED: "Gagal",
    RUNNING: "Running", STOPPED: "Stopped", EXITED: "Exited",
  };
  
  return (
    <Badge className={`text-xs border ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status}
    </Badge>
  );
}
