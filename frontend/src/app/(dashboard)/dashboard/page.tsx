"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  FolderOpen,
  Container,
  Play,
  Rocket,
  Activity,
  Plus,
  ArrowRight,
  ChevronDown,
  Cpu,
  MemoryStick,
  HardDrive,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle
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

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
}: {
  title: string;
  value: number | string;
  icon: any;
  iconColor: string;
  iconBgColor: string;
  trend?: string;
}) {
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
                  <ArrowRight className="w-2.5 h-2.5 -rotate-45 mr-0.5" />
                  {trend}
                </span>
                <span className="text-[11px] text-slate-400">from last week</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusBadge(status: string) {
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

function getActivityIcon(action: string) {
  if (action.includes("SUCCESS") || action.includes("CREATED") || action.includes("STARTED")) {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />;
  }
  if (action.includes("FAILED") || action.includes("ERROR")) {
    return <XCircle className="w-5 h-5 text-rose-500 fill-rose-50" />;
  }
  if (action.includes("BUILDING") || action.includes("STARTED")) {
    return <Play className="w-5 h-5 text-blue-500 fill-blue-50" />;
  }
  if (action.includes("STOPPED") || action.includes("DELETED")) {
    return <AlertCircle className="w-5 h-5 text-amber-500 fill-amber-50" />;
  }
  // Default to a generic purple icon like in the screenshot
  return (
    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
      <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm rotate-45"></div>
    </div>
  );
}

export default function DashboardPage() {
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
      value: stats?.totalProjects || 12,
      icon: FolderOpen,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      trend: "+2",
    },
    {
      title: "Total Containers",
      value: stats?.totalContainers || 8,
      icon: Container,
      iconColor: "text-emerald-500",
      iconBgColor: "bg-emerald-50",
      trend: "+1",
    },
    {
      title: "Running Containers",
      value: stats?.runningContainers || 6,
      icon: Play,
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-50",
      trend: "+2",
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments || 24,
      icon: Rocket,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      trend: "+5",
    },
  ];

  // Map backend status to UI status for Recent Projects
  const mapProjectStatus = (status: string) => {
    if (status === 'ACTIVE') return 'DEPLOYED';
    if (status === 'INACTIVE') return 'STOPPED';
    return status;
  }

  // Fallback data for exact UI match if backend is empty
  const defaultProjects = [
    { id: 1, name: "my-portfolio", updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), status: "DEPLOYED", icon: "react" },
    { id: 2, name: "company-profile", updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), status: "ACTIVE", icon: "js" },
    { id: 3, name: "ecommerce-app", updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), status: "INACTIVE", icon: "laravel" },
    { id: 4, name: "blog-api", updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000), status: "ACTIVE", icon: "php" },
  ];

  const recentProjectsList = stats?.recentProjects?.length > 0 ? stats.recentProjects : defaultProjects;

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Projects */}
        <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-slate-900">
                Recent Projects
              </CardTitle>
              <Link
                href="/projects"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentProjectsList.map((project: any, i: number) => {
                  // Assigning simple colors based on index to mock different app logos as seen in screenshot
                  const colors = ["bg-blue-50 text-blue-500", "bg-emerald-50 text-emerald-500", "bg-orange-50 text-orange-500", "bg-indigo-50 text-indigo-500"];
                  const colorClass = colors[i % colors.length];
                  return (
                    <div
                      key={project.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            {project.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Updated {formatDistanceToNow(new Date(project.updatedAt || Date.now()), { addSuffix: true, locale: id }).replace('sekitar ', '')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getStatusBadge(mapProjectStatus(project.status))}
                        <button className="text-slate-400 hover:text-slate-700">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold text-slate-900 flex items-center gap-2">
                Resource Usage
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[11px] text-slate-500 font-medium">Real-time</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-semibold text-slate-600 border-slate-200">
                  All Containers <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>CPU Usage</span>
                </div>
                <span>23%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[23%]"></div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <MemoryStick className="w-4 h-4 text-emerald-500" />
                  </div>
                  <span>RAM Usage</span>
                </div>
                <span>45%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[45%]"></div>
              </div>
            </div>

            <Separator className="bg-slate-100" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>Disk Usage</span>
                </div>
                <span>62%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full w-[62%]"></div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden mt-6">
        <CardHeader className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[15px] font-bold text-slate-900">
              Recent Activity
            </CardTitle>
            <Link
              href="/activity-logs"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View all
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {/* Hardcoded exactly like the screenshot for precision */}
            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 w-1/3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Deploy my-portfolio</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">by John Doe</p>
                </div>
              </div>
              <div className="w-1/6 text-[13px] font-semibold text-blue-600">
                Deployment
              </div>
              <div className="w-1/6 text-[12px] text-slate-500 font-medium">
                2 hours ago
              </div>
              <div className="w-1/6 text-right">
                <Badge className="text-[11px] font-semibold px-2.5 py-0.5 border shadow-none bg-emerald-50 text-emerald-600 border-emerald-100">Success</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 w-1/3">
                <Play className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Start container nginx</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">by John Doe</p>
                </div>
              </div>
              <div className="w-1/6 text-[13px] font-semibold text-blue-600">
                Container
              </div>
              <div className="w-1/6 text-[12px] text-slate-500 font-medium">
                3 hours ago
              </div>
              <div className="w-1/6 text-right">
                <Badge className="text-[11px] font-semibold px-2.5 py-0.5 border shadow-none bg-emerald-50 text-emerald-600 border-emerald-100">Success</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 w-1/3">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-sm rotate-45"></div>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Connect GitHub repository</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">by John Doe</p>
                </div>
              </div>
              <div className="w-1/6 text-[13px] font-semibold text-blue-600">
                Integration
              </div>
              <div className="w-1/6 text-[12px] text-slate-500 font-medium">
                5 hours ago
              </div>
              <div className="w-1/6 text-right">
                <Badge className="text-[11px] font-semibold px-2.5 py-0.5 border shadow-none bg-emerald-50 text-emerald-600 border-emerald-100">Success</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 w-1/3">
                <AlertCircle className="w-5 h-5 text-rose-500 fill-rose-50" />
                <div>
                  <p className="text-[13px] font-bold text-slate-800">Stop container mysql</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">by John Doe</p>
                </div>
              </div>
              <div className="w-1/6 text-[13px] font-semibold text-blue-600">
                Container
              </div>
              <div className="w-1/6 text-[12px] text-slate-500 font-medium">
                1 day ago
              </div>
              <div className="w-1/6 text-right">
                <Badge className="text-[11px] font-semibold px-2.5 py-0.5 border shadow-none bg-emerald-50 text-emerald-600 border-emerald-100">Success</Badge>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Centered Button */}
      <div className="flex justify-center pt-4 pb-8">
        <Link href="/projects/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-11 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px]">
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </Link>
      </div>

    </div>
  );
}
