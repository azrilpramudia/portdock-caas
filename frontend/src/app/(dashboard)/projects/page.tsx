"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  FolderOpen,
  Container,
  MoreHorizontal,
  Trash2,
  Rocket,
  Loader2,
  ArrowRight,
  Eye,
  Pencil,
  ExternalLink,
  FileArchive,
  FileCode2,
  Atom,
  Hexagon,
  Layers,
  Database,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { getProjectIcon, getDeployTypeDetails } from "@/utils/icon-helpers";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import api from "@/lib/api";
import { useProjectsList, useDeleteProject } from "@/hooks/useProjects";

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
  trendColor,
}: {
  title: string;
  value: number | string;
  icon: any;
  iconColor: string;
  iconBgColor: string;
  trend?: string;
  trendColor?: string;
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
                <span className={`text-[11px] font-semibold ${trendColor === 'red' ? 'text-rose-500 bg-rose-50' : 'text-emerald-500 bg-emerald-50'} px-1.5 py-0.5 rounded flex items-center`}>
                  {trendColor === 'red' ? (
                    <ArrowRight className="w-2.5 h-2.5 rotate-45 mr-0.5" />
                  ) : (
                    <ArrowRight className="w-2.5 h-2.5 -rotate-45 mr-0.5" />
                  )}
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
  const isRunning = status === "ACTIVE" || status === "DEPLOYED";
  const label = isRunning ? "Running" : (status === "INACTIVE" ? "Stopped" : status);
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
      <span className="text-[13px] font-medium text-slate-600">{label}</span>
    </div>
  );
}

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Use the monitoring dashboard stats for the top cards
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/monitoring/dashboard");
      return res.data;
    },
    refetchInterval: 60000,
  });

  // Main projects list query
  const { data, isLoading } = useProjectsList(search, statusFilter === "all" ? "" : statusFilter);
  const deleteMutation = useDeleteProject(() => setDeleteId(null));

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      trend: stats?.totalProjects ? "+2" : "",
    },
    {
      title: "Running Projects",
      value: stats?.runningContainers || 0, 
      icon: Container,
      iconColor: "text-emerald-500",
      iconBgColor: "bg-emerald-50",
      trend: stats?.runningContainers ? "+1" : "",
    },
    {
      title: "Stopped Projects",
      value: Math.max(0, (stats?.totalProjects || 0) - (stats?.runningContainers || 0)),
      icon: Database,
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-50",
      trend: stats?.totalProjects ? "-1" : "",
      trendColor: "red"
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments || 0,
      icon: Rocket,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      trend: stats?.totalDeployments ? "+5" : "",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[17px] font-bold text-slate-900">All Projects</h2>
            <Link href="/projects/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px]">
                <Plus className="w-4 h-4 mr-1.5" /> Create New Project
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search projects by name, domain, or type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-slate-50/50 border-slate-200 text-[13px] rounded-xl focus-visible:ring-blue-500/20"
              />
            </div>
            <div className="relative w-40">
              <select 
                className="w-full h-10 pl-10 pr-8 text-[13px] font-medium text-slate-700 bg-white border border-slate-200 rounded-xl appearance-none outline-none focus:border-blue-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Running</option>
                <option value="INACTIVE">Stopped</option>
                <option value="FAILED">Failed</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : data?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[12px] font-semibold text-slate-500 bg-slate-50/50">
                  <th className="px-6 py-3 font-semibold">Project Name <span className="inline-block ml-1 opacity-50">↕</span></th>
                  <th className="px-6 py-3 font-semibold">Type <span className="inline-block ml-1 opacity-50">↕</span></th>
                  <th className="px-6 py-3 font-semibold">Domain <span className="inline-block ml-1 opacity-50">↕</span></th>
                  <th className="px-6 py-3 font-semibold">Status <span className="inline-block ml-1 opacity-50">↕</span></th>
                  <th className="px-6 py-3 font-semibold">Last Updated <span className="inline-block ml-1 opacity-50">↕</span></th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.data.map((project: any) => {
                  const iconStyle = getProjectIcon(project.name);
                  const typeDetails = getDeployTypeDetails(project.deploymentType || "ZIP");
                  const mockedDomain = `${project.name.toLowerCase().replace(/\s+/g, '-')}.portdock.id`;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 ${iconStyle.bg} ${iconStyle.text} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                            <iconStyle.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[14px] font-bold text-slate-800">{project.name}</p>
                            <p className="text-[12px] text-slate-500 mt-0.5">{project.description || "No description provided"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <typeDetails.icon className="w-4 h-4 text-slate-600" />
                          <span className="text-[13px] font-semibold text-slate-700">{typeDetails.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-blue-600 cursor-pointer transition-colors">
                          {mockedDomain}
                          <ExternalLink className="w-3 h-3 text-blue-500" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(project.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[13px] text-slate-500 font-medium">
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: id }).replace('sekitar ', '')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-[12px] font-semibold shadow-sm">
                              <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> View
                            </Button>
                          </Link>
                          <Link href={`/projects/${project.id}/settings`}>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm">
                              <Pencil className="w-3.5 h-3.5 text-slate-500" />
                            </Button>
                          </Link>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm outline-none transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-slate-500" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-200">
                              <Link href={`/projects/${project.id}/deploy`}>
                                <DropdownMenuItem className="cursor-pointer text-slate-700 font-medium">
                                  <Rocket className="w-4 h-4 mr-2 text-slate-400" /> Deploy
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 font-medium cursor-pointer"
                                onClick={() => setDeleteId(project.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-500 text-[13px] mb-6 max-w-sm leading-relaxed">
              You haven't created any deployment projects yet. Get started by creating your first project.
            </p>
            <Link href="/projects/new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
                <Plus className="w-4 h-4 mr-2" /> Create First Project
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Hapus Project?</DialogTitle>
            <DialogDescription className="text-slate-500">
              Tindakan ini tidak dapat dibatalkan. Semua container yang terkait juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Hapus Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
