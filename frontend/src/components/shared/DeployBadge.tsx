import { Badge } from "@/components/ui/badge";

export function DeployBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    ZIP: "bg-purple-100 text-purple-700 border-purple-200",
    GITHUB: "bg-slate-100 text-slate-700 border-slate-200",
    DOCKERFILE: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <Badge className={`text-xs border ${map[type] || "bg-slate-100 text-slate-600"}`}>
      {type}
    </Badge>
  );
}
