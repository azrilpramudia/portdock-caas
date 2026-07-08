import { Rocket, CheckCircle2, Clock, XCircle, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DeploymentStatsDto } from "@/hooks/useAdmin";

interface DeploymentStatsProps {
  stats?: DeploymentStatsDto;
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

export function DeploymentStats({ stats }: DeploymentStatsProps) {
  const statCards = [
    {
      title: "Deployments Today",
      value: stats?.deploymentsToday ?? 0,
      trend: stats?.deploymentsTodayTrend,
      label: "dari kemarin",
      icon: Rocket,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      title: "Successful",
      value: stats?.successfulDeployments ?? 0,
      trend: stats?.successfulDeploymentsTrend,
      label: "dari minggu lalu",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      title: "In Progress",
      value: stats?.inProgressDeployments ?? 0,
      trend: stats?.inProgressDeploymentsTrend,
      label: "dari minggu lalu",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      title: "Failed",
      value: stats?.failedDeployments ?? 0,
      trend: stats?.failedDeploymentsTrend,
      label: "dari minggu lalu",
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments ?? 0,
      trend: stats?.totalDeploymentsTrend,
      label: "dari bulan lalu",
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
                <TrendIndicator value={stat.trend} timeframe={stat.label} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
