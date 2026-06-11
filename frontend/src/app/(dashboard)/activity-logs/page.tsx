"use client";

import { useQuery } from "@tanstack/react-query";
import { ScrollText, Activity, CheckCircle2, XCircle, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

function getActivityIcon(action: string) {
  if (action.includes("SUCCESS") || action.includes("CREATED") || action.includes("STARTED") || action.includes("REGISTER") || action.includes("LOGIN")) {
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  }
  if (action.includes("FAILED") || action.includes("ERROR") || action.includes("DELETED") || action.includes("REMOVED")) {
    return <XCircle className="w-4 h-4 text-red-500" />;
  }
  if (action.includes("BUILDING") || action.includes("RESTARTED") || action.includes("STOPPED")) {
    return <Activity className="w-4 h-4 text-orange-500" />;
  }
  return <Clock className="w-4 h-4 text-slate-400" />;
}

function getActionLabel(action: string) {
  const labels: Record<string, string> = {
    REGISTER: "Registrasi",
    LOGIN: "Login",
    PROJECT_CREATED: "Project Dibuat",
    PROJECT_UPDATED: "Project Diupdate",
    PROJECT_DELETED: "Project Dihapus",
    DEPLOYMENT_STARTED: "Deployment Dimulai",
    DEPLOYMENT_SUCCESS: "Deployment Berhasil",
    DEPLOYMENT_FAILED: "Deployment Gagal",
    CONTAINER_CREATED: "Container Dibuat",
    CONTAINER_STARTED: "Container Distart",
    CONTAINER_STOPPED: "Container Distop",
    CONTAINER_RESTARTED: "Container Direstart",
    CONTAINER_DELETED: "Container Dihapus",
  };
  return labels[action] || action;
}

function getActionBadge(action: string) {
  if (action.includes("SUCCESS") || action.includes("CREATED") || action.includes("STARTED") || action.includes("REGISTER") || action.includes("LOGIN")) {
    return "bg-green-100 text-green-700 border-green-200";
  }
  if (action.includes("FAILED") || action.includes("ERROR") || action.includes("DELETED")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function ActivityLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs"],
    queryFn: async () => {
      const res = await api.get("/activity-logs?limit=50");
      return res.data;
    },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
        <p className="text-slate-500 mt-1">Riwayat semua aktivitas di platform Anda</p>
      </div>

      <Card className="bg-white border border-slate-200/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-blue-500" />
              Log Aktivitas
            </CardTitle>
            {data && (
              <span className="text-xs text-slate-400">{data.total} total aktivitas</span>
            )}
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : data?.data?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.data.map((log: any) => (
                <div key={log.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">{getActivityIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs border ${getActionBadge(log.action)}`}>
                        {getActionLabel(log.action)}
                      </Badge>
                      {log.project && (
                        <span className="text-xs text-blue-500 font-medium">{log.project.name}</span>
                      )}
                    </div>
                    {log.description && (
                      <p className="text-sm text-slate-700 mt-1">{log.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 mt-0.5">
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">Belum ada aktivitas tercatat</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
