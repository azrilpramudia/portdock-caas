import { Rocket, CheckCircle2, Clock, XCircle, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeploymentStatsDto } from "@/hooks/useAdmin";

interface DeploymentStatsProps {
  stats?: DeploymentStatsDto;
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

export function DeploymentStats({ stats }: DeploymentStatsProps) {
  const statCards = [
    {
      title: "Deployments Today",
      value: stats?.deploymentsToday ?? 0,
      trend: stats?.deploymentsTodayTrend,
      label1: "dari",
      label2: "kemarin",
      icon: Rocket,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Successful",
      value: stats?.successfulDeployments ?? 0,
      trend: stats?.successfulDeploymentsTrend,
      label1: "dari minggu",
      label2: "lalu",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "In Progress",
      value: stats?.inProgressDeployments ?? 0,
      trend: stats?.inProgressDeploymentsTrend,
      label1: "dari minggu",
      label2: "lalu",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      title: "Failed",
      value: stats?.failedDeployments ?? 0,
      trend: stats?.failedDeploymentsTrend,
      label1: "dari minggu",
      label2: "lalu",
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments ?? 0,
      trend: stats?.totalDeploymentsTrend,
      label1: "dari bulan",
      label2: "lalu",
      icon: Activity,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="border-border shadow-sm">
            <CardContent className="p-6 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.color}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                <TrendIndicator value={stat.trend} label1={stat.label1} label2={stat.label2} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
