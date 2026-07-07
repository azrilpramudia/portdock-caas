import { Rocket, CheckCircle2, Clock, XCircle, Activity, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DeploymentStats() {
  const stats = [
    {
      title: "Deployments Today",
      value: "24",
      change: "14% dari kemarin",
      trend: "up",
      icon: Rocket,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-500/10",
      borderColor: "border-blue-100 dark:border-blue-500/20",
    },
    {
      title: "Successful",
      value: "186",
      change: "10% dari minggu lalu",
      trend: "up",
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
      borderColor: "border-emerald-100 dark:border-emerald-500/20",
    },
    {
      title: "In Progress",
      value: "12",
      change: "5% dari minggu lalu",
      trend: "up",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10",
      borderColor: "border-amber-100 dark:border-amber-500/20",
    },
    {
      title: "Failed",
      value: "8",
      change: "15% dari minggu lalu",
      trend: "down",
      icon: XCircle,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
      borderColor: "border-rose-100 dark:border-rose-500/20",
    },
    {
      title: "Total Deployments",
      value: "1,248",
      change: "12% dari minggu lalu",
      trend: "up",
      icon: Activity,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-500/10",
      borderColor: "border-purple-100 dark:border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className="p-5 flex flex-col justify-between border-slate-200 dark:border-slate-800 shadow-sm bg-card hover:shadow-md transition-shadow rounded-2xl">
            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.borderColor} border`}>
                <Icon className={`w-6 h-6 ${stat.color} fill-current/20`} strokeWidth={2.5} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{stat.value}</h3>
              </div>
            </div>
            
            <div className="mt-5 flex items-center justify-center sm:justify-start gap-1.5">
              {stat.trend === "up" ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={3} />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-rose-500 shrink-0" strokeWidth={3} />
              )}
              <span className={`text-[12px] font-bold ${stat.trend === "up" ? 'text-emerald-500' : 'text-rose-500'}`}>
                {stat.change.split(' ')[0]}
              </span>
              <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
                {stat.change.substring(stat.change.indexOf(' '))}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
