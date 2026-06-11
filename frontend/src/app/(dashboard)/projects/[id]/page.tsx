"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderOpen,
  Container,
  Rocket,
  Clock,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { id } from "date-fns/locale";

function getContainerStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string; icon: any }> = {
    RUNNING: { label: "Running", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
    STOPPED: { label: "Stopped", className: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
    BUILDING: { label: "Building", className: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Loader2 },
    ERROR: { label: "Error", className: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  };
  const s = map[status] || map.STOPPED;
  const Icon = s.icon;
  return (
    <Badge className={`text-xs border flex items-center gap-1.5 ${s.className}`}>
      <Icon className={`w-3 h-3 ${status === "BUILDING" ? "animate-spin" : ""}`} />
      {s.label}
    </Badge>
  );
}

export default function ProjectDetailPage() {
  const { id: projectId } = useParams();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <Badge className={`text-xs border ${
              project.status === "ACTIVE" ? "bg-green-100 text-green-700 border-green-200" :
              project.status === "BUILDING" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
              project.status === "FAILED" ? "bg-red-100 text-red-700 border-red-200" :
              "bg-slate-100 text-slate-600 border-slate-200"
            }`}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p className="text-slate-500 mt-1 text-sm">{project.description}</p>
          )}
        </div>
        <Link href={`/projects/${projectId}/deploy`}>
          <Button className="portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90">
            <Rocket className="w-4 h-4 mr-2" />
            Deploy
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Containers */}
          <Card className="bg-white border border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Container className="w-4 h-4 text-blue-500" />
                Containers ({project.containers?.length || 0})
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {project.containers?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {project.containers.map((container: any) => (
                    <Link
                      key={container.id}
                      href={`/containers/${container.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Container className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{container.name}</p>
                        <p className="text-xs text-slate-400">{container.imageName}:{container.imageTag}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {getContainerStatusBadge(container.status)}
                        {container.hostPort && (
                          <span className="text-xs text-slate-400">:{container.hostPort}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Container className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Belum ada container</p>
                  <Link href={`/projects/${projectId}/deploy`} className="mt-3">
                    <Button size="sm" className="portdock-gradient text-white hover:opacity-90">
                      <Rocket className="w-3 h-3 mr-1.5" /> Deploy sekarang
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Logs */}
          <Card className="bg-white border border-slate-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Aktivitas Terbaru
              </CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {project.activityLogs?.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {project.activityLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 px-6 py-3.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{log.description || log.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true, locale: id })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">Belum ada aktivitas</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-5">
          <Card className="bg-white border border-slate-200/60 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Deployment Type</p>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">{project.deploymentType}</Badge>
              </div>
              {project.repositoryUrl && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Repository</p>
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{project.repositoryUrl.replace("https://github.com/", "")}</span>
                  </a>
                </div>
              )}
              {project.domain && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Domain</p>
                  <a
                    href={`http://${project.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate">{project.domain}</span>
                  </a>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Dibuat</p>
                <p className="text-sm text-slate-700">
                  {format(new Date(project.createdAt), "dd MMM yyyy, HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Terakhir diupdate</p>
                <p className="text-sm text-slate-700">
                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: id })}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Link href={`/projects/${projectId}/deploy`} className="w-full">
              <Button className="w-full portdock-gradient text-white hover:opacity-90">
                <Rocket className="w-4 h-4 mr-2" /> Deploy Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
