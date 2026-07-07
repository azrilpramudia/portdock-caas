import { Folder, ClipboardCheck, Rocket } from "lucide-react";
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

const TrendIndicator = ({ value, label = "dari minggu lalu" }: { value?: number, label?: string }) => {
  if (value === undefined || value === null) return null;
  const isPositive = value >= 0;
  return (
    <p className={`text-xs font-medium mt-1 flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(value)}% <span className="text-muted-foreground font-normal ml-1">{label}</span>
    </p>
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
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
            <Folder className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
            <h3 className="text-2xl font-bold mt-1">{totalProjects}</h3>
            <TrendIndicator value={totalProjectsTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
            <ClipboardCheck className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
            <h3 className="text-2xl font-bold mt-1">{activeProjects}</h3>
            <TrendIndicator value={activeProjectsTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-amber-500">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M10 15V9M14 15V9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inactive Projects</p>
            <h3 className="text-2xl font-bold mt-1">{pausedProjects}</h3>
            <TrendIndicator value={pausedProjectsTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-rose-500">
              <circle cx="12" cy="12" r="10" fill="currentColor" />
              <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Failed Projects</p>
            <h3 className="text-2xl font-bold mt-1">{failedProjects}</h3>
            <TrendIndicator value={failedProjectsTrend} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-500 shrink-0">
            <Rocket className="w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Deployments Today</p>
            <h3 className="text-2xl font-bold mt-1">{deploymentsToday}</h3>
            <TrendIndicator value={deploymentsTrend} label="dari kemarin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
