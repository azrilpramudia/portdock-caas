"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Container,
  Play,
  Square,
  RotateCcw,
  Trash2,
  BarChart3,
  Loader2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useContainersList, useContainerAction, useDeleteContainer } from "@/hooks/useContainers";



function ActionButton({
  onClick,
  disabled,
  title,
  className,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-8 w-8 flex items-center justify-center rounded-lg transition-colors disabled:opacity-50",
        className
      )}
    >
      {children}
    </button>
  );
}

export default function ContainersPage() {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data: containers, isLoading } = useContainersList("", "");
  const containerAction = useContainerAction();
  const deleteMutation = useDeleteContainer(() => setDeleteId(null));

  const doAction = async (action: "start" | "stop" | "restart", containerId: string) => {
    setActionLoading(`${action}-${containerId}`);
    try {
      await containerAction.mutateAsync({ id: containerId, action });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Containers</h1>
          <p className="text-slate-500 mt-1">Kelola semua container Docker Anda</p>
        </div>
        <Link href="/projects/new">
          <Button className="portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Project Baru
          </Button>
        </Link>
      </div>

      {/* Summary */}
      {containers && (
        <div className="flex items-center gap-6 text-sm text-slate-600">
          <span>
            Total:{" "}
            <strong className="text-slate-900">{containers.length}</strong>
          </span>
          <span>
            Running:{" "}
            <strong className="text-green-600">
              {
                containers.filter((c: any) => c.status === "RUNNING").length
              }
            </strong>
          </span>
          <span>
            Stopped:{" "}
            <strong className="text-slate-500">
              {
                containers.filter((c: any) => c.status === "STOPPED").length
              }
            </strong>
          </span>
        </div>
      )}

      {/* Containers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : containers?.length > 0 ? (
        <div className="space-y-3">
          {containers.map((container: any) => (
            <Card
              key={container.id}
              className="bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-150"
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Icon + Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        container.status === "RUNNING"
                          ? "bg-green-50"
                          : "bg-slate-100"
                      )}
                    >
                      <Container
                        className={cn(
                          "w-5 h-5",
                          container.status === "RUNNING"
                            ? "text-green-600"
                            : "text-slate-500"
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900 truncate">
                          {container.name}
                        </p>
                        <StatusBadge status={container.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {container.imageName}:{container.imageTag}
                        {container.hostPort && ` · Port: ${container.hostPort}`}
                        {container.project && ` · ${container.project.name}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link href={`/monitoring/${container.id}`}>
                      <ActionButton
                        title="Monitoring"
                        className="hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </ActionButton>
                    </Link>

                    {container.hostPort && (
                      <ActionButton
                        title="Buka aplikasi"
                        className="hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                        onClick={() =>
                          window.open(
                            `http://localhost:${container.hostPort}`,
                            "_blank"
                          )
                        }
                      >
                        <ExternalLink className="w-4 h-4" />
                      </ActionButton>
                    )}

                    {container.status === "STOPPED" ||
                    container.status === "ERROR" ? (
                      <ActionButton
                        title="Start"
                        className="hover:bg-green-50 text-slate-500 hover:text-green-600"
                        onClick={() => doAction("start", container.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === `start-${container.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </ActionButton>
                    ) : (
                      <ActionButton
                        title="Stop"
                        className="hover:bg-orange-50 text-slate-500 hover:text-orange-600"
                        onClick={() => doAction("stop", container.id)}
                        disabled={!!actionLoading}
                      >
                        {actionLoading === `stop-${container.id}` ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </ActionButton>
                    )}

                    <ActionButton
                      title="Restart"
                      className="hover:bg-blue-50 text-slate-500 hover:text-blue-600"
                      onClick={() => doAction("restart", container.id)}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === `restart-${container.id}` ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                    </ActionButton>

                    <ActionButton
                      title="Hapus container"
                      className="hover:bg-red-50 text-slate-500 hover:text-red-600"
                      onClick={() => setDeleteId(container.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </ActionButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <Container className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Belum ada container
          </h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Container akan muncul setelah Anda mendeploy project.
          </p>
          <Link href="/projects/new">
            <Button className="portdock-gradient text-white shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4 mr-2" /> Buat Project Baru
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Container?</DialogTitle>
            <DialogDescription>
              Container akan dihentikan dan dihapus secara permanen dari Docker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
