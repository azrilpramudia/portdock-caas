"use client";

import Link from "next/link";
import { FolderOpen, MoreHorizontal, Play, Square, RefreshCw, Rocket, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { StatusBadge } from "./StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { projectsService } from "@/services/projects.service";
import { containersService } from "@/services/containers.service";
import { toast } from "sonner";

export function RecentProjectsList({ projects, isLoading }: { projects: any[], isLoading: boolean }) {
  const recentProjectsList = projects || [];
  const router = useRouter();
  const queryClient = useQueryClient();

  const startContainerMutation = useMutation({
    mutationFn: (id: string) => containersService.startContainer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  });

  const stopContainerMutation = useMutation({
    mutationFn: (id: string) => containersService.stopContainer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  });

  const restartContainerMutation = useMutation({
    mutationFn: (id: string) => containersService.restartContainer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
  });

  const getProjectStatus = (project: any) => {
    if (!project.containers || project.containers.length === 0) {
      if (project.status === 'FAILED') return 'FAILED';
      if (project.status === 'BUILDING') return 'BUILDING';
      return 'STOPPED';
    }
    
    // If any container is running, the project is deployed
    const isRunning = project.containers.some((c: any) => c.status === 'RUNNING');
    if (isRunning) return 'DEPLOYED';
    
    // Otherwise, check if they are all stopped
    return 'STOPPED';
  };

  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="px-6 py-5 border-b border-border shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-foreground">
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
      <CardContent className="p-0 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : recentProjectsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 flex-1 text-muted-foreground">
            <FolderOpen className="w-10 h-10 mb-3 text-muted-foreground/30" />
            <p className="text-sm font-medium">No projects found</p>
          </div>
        ) : (
          <div className="divide-y divide-border flex-1">
            {recentProjectsList.map((project: any, i: number) => {
              const colors = ["bg-blue-500/10 text-blue-500", "bg-emerald-500/10 text-emerald-500", "bg-orange-500/10 text-orange-500", "bg-indigo-500/10 text-indigo-500"];
              const colorClass = colors[i % colors.length];
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className={`w-11 h-11 ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">
                        {project.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Updated {formatDistanceToNow(new Date(project.updatedAt || Date.now()), { addSuffix: true, locale: id }).replace('sekitar ', '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={getProjectStatus(project)} />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground outline-none p-1 rounded-md hover:bg-accent transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-border shadow-lg p-1">
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold text-[13px] text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/10 py-2 rounded-lg"
                          onClick={() => {
                            const containerId = project.containers?.[0]?.id;
                            if (containerId) {
                              toast.promise(startContainerMutation.mutateAsync(containerId), {
                                loading: 'Starting container...',
                                success: 'Container started successfully',
                                error: 'Failed to start container'
                              });
                            }
                          }}
                        >
                          <Play className="w-4 h-4 mr-2" /> Start
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold text-[13px] text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/10 py-2 rounded-lg"
                          onClick={() => {
                            const containerId = project.containers?.[0]?.id;
                            if (containerId) {
                              toast.promise(stopContainerMutation.mutateAsync(containerId), {
                                loading: 'Stopping container...',
                                success: 'Container stopped successfully',
                                error: 'Failed to stop container'
                              });
                            }
                          }}
                        >
                          <Square className="w-4 h-4 mr-2" /> Stop
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold text-[13px] text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/10 py-2 rounded-lg"
                          onClick={() => {
                            const containerId = project.containers?.[0]?.id;
                            if (containerId) {
                              toast.promise(restartContainerMutation.mutateAsync(containerId), {
                                loading: 'Restarting container...',
                                success: 'Container restarted successfully',
                                error: 'Failed to restart container'
                              });
                            }
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Restart
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold text-[13px] text-muted-foreground hover:text-primary focus:text-primary focus:bg-primary/10 py-2 rounded-lg"
                          onClick={() => router.push(`/deploy`)}
                        >
                          <Rocket className="w-4 h-4 mr-2" /> Deploy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border my-1" />
                        <DropdownMenuItem 
                          className="cursor-pointer font-semibold text-[13px] text-red-600 hover:text-red-700 focus:text-red-700 focus:bg-red-50 py-2 rounded-lg"
                          onClick={() => {
                            toast.promise(deleteProjectMutation.mutateAsync(project.id), {
                              loading: 'Deleting project...',
                              success: 'Project deleted successfully',
                              error: 'Failed to delete project'
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
