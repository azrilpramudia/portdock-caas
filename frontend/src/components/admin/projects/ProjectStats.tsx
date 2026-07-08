import { Folder, ClipboardCheck, Rocket, PauseCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectStatsProps {
  totalProjects: number;
  activeProjects: number;
  pausedProjects: number;
  failedProjects: number;
  deploymentsToday: number;
  totalProjectsTrend?: number;
  activeProjectsTrend?: number;
  pausedProjectsTrend?: number;
  failedProjectsTrend?: number;
  deploymentsTrend?: number;
}

const TrendIndicator = ({ value, label1, label2 }: { value?: number, label1: string, label2: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  const colorClass = isPositive ? 'text-emerald-500' : 'text-rose-500';
  
  return (
    <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px] leading-tight">
      <span className={colorClass}>{isPositive ? '↑' : '↓'}</span>
      <span className="text-muted-foreground">{label1}</span>
      <span className={`font-bold ${colorClass}`}>{Math.abs(value)}%</span>
      <span className="text-muted-foreground">{label2}</span>
    </div>
  );
};

export function ProjectStats({
  totalProjects,
  activeProjects,
  pausedProjects,
  failedProjects,
  deploymentsToday,
  totalProjectsTrend,
  activeProjectsTrend,
  pausedProjectsTrend,
  failedProjectsTrend,
  deploymentsTrend
}: ProjectStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Folder className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
            <h3 className="text-2xl font-bold mt-1">{totalProjects}</h3>
            <TrendIndicator value={totalProjectsTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ClipboardCheck className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
            <h3 className="text-2xl font-bold mt-1">{activeProjects}</h3>
            <TrendIndicator value={activeProjectsTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <PauseCircle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inactive Projects</p>
            <h3 className="text-2xl font-bold mt-1">{pausedProjects}</h3>
            <TrendIndicator value={pausedProjectsTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <XCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Failed Projects</p>
            <h3 className="text-2xl font-bold mt-1">{failedProjects}</h3>
            <TrendIndicator value={failedProjectsTrend} label1="dari minggu" label2="lalu" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <Rocket className="w-6 h-6 text-violet-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deployments Today</p>
            <h3 className="text-2xl font-bold mt-1">{deploymentsToday}</h3>
            <TrendIndicator value={deploymentsTrend} label1="dari" label2="kemarin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
