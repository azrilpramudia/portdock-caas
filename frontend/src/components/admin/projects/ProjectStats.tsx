import { Folder, ClipboardCheck, Rocket, PauseCircle, XCircle, ArrowUp, ArrowDown } from "lucide-react";
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

const TrendIndicator = ({ value, timeframe }: { value?: number, timeframe: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  
  return (
    <div className="flex items-start text-[10px] xl:text-[11px] mt-0.5">
      <span className={`font-bold flex items-center shrink-0 ${isPositive ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded' : 'text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded'}`}>
        {isPositive ? <ArrowUp className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDown className="w-2.5 h-2.5 mr-0.5" />}
        {Math.abs(value)}%
      </span>
      <span className="text-muted-foreground ml-1.5 font-medium leading-tight pt-[1px]">{timeframe}</span>
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
            <TrendIndicator value={totalProjectsTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={activeProjectsTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={pausedProjectsTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={failedProjectsTrend} timeframe="dari minggu lalu" />
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
            <TrendIndicator value={deploymentsTrend} timeframe="dari kemarin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
