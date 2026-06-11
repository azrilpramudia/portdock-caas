"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderOpen,
  Container,
  Play,
  Activity,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useAuthStore } from "@/store/auth";

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  description,
}: {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
  description?: string;
}) {
  return (
    <Card className="bg-white border border-slate-200/60 shadow-sm portdock-card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <TrendingUp className="w-4 h-4 text-slate-300" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm font-medium text-slate-600 mt-1">{title}</p>
          {description && (
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getActivityIcon(action: string) {
  if (action.includes("SUCCESS") || action.includes("CREATED") || action.includes("STARTED")) {
    return <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />;
  }
  if (action.includes("FAILED") || action.includes("ERROR")) {
    return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  }
  if (action.includes("BUILDING") || action.includes("STARTED")) {
    return <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 animate-spin" />;
  }
  if (action.includes("STOPPED") || action.includes("DELETED")) {
    return <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />;
  }
  return <Activity className="w-4 h-4 text-slate-400 flex-shrink-0" />;
}

function getStatusBadge(status: string) {
  const statusMap: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: "Aktif", className: "bg-green-100 text-green-700 border-green-200" },
    INACTIVE: { label: "Tidak Aktif", className: "bg-slate-100 text-slate-600 border-slate-200" },
    BUILDING: { label: "Building", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    FAILED: { label: "Gagal", className: "bg-red-100 text-red-700 border-red-200" },
  };
  const s = statusMap[status] || { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <Badge className={`text-xs font-medium border ${s.className}`}>
      {s.label}
    </Badge>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/monitoring/dashboard");
      return res.data;
    },
    refetchInterval: 30000,
  });

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects ?? 0,
      icon: FolderOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Projects yang dibuat",
    },
    {
      title: "Total Containers",
      value: stats?.totalContainers ?? 0,
      icon: Container,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Container terdeploy",
    },
    {
      title: "Running",
      value: stats?.runningContainers ?? 0,
      icon: Play,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Container aktif",
    },
    {
      title: "Deployments",
      value: stats?.totalDeployments ?? 0,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Total deployment",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Selamat datang, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Pantau dan kelola deployment aplikasi Anda
          </p>
        </div>
        <Link href="/projects/new">
          <Button
            id="btn-new-project-dashboard"
            className="portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Project Baru
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Project Terbaru
              </CardTitle>
              <Link
                href="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                Lihat semua
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : stats?.recentProjects?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recentProjects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {project.deploymentType} ·{" "}
                        {project.containers?.length || 0} container
                      </p>
                    </div>
                    {getStatusBadge(project.status)}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FolderOpen className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Belum ada project</p>
                <Link href="/projects/new" className="mt-3">
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    Buat project pertama
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">
                Aktivitas Terbaru
              </CardTitle>
              <Link
                href="/activity-logs"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
              >
                Lihat semua
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : stats?.recentActivity?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.recentActivity.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 px-6 py-3.5">
                    <div className="mt-0.5">{getActivityIcon(log.action)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">
                        {log.description || log.action}
                      </p>
                      {log.project && (
                        <p className="text-xs text-blue-500 mt-0.5 font-medium">
                          {log.project.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Activity className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">Belum ada aktivitas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
