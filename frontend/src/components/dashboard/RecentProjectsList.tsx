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

export function RecentProjectsList({ projects, isLoading }: { projects: any[], isLoading: boolean }) {
  const recentProjectsList = projects || [];

  const mapProjectStatus = (status: string) => {
    if (status === 'ACTIVE') return 'DEPLOYED';
    if (status === 'INACTIVE') return 'STOPPED';
    return status;
  };

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden flex flex-col h-full">
      <CardHeader className="px-6 py-5 border-b border-slate-100 shrink-0">
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
      <CardContent className="p-0 flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 flex-1">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : recentProjectsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 flex-1 text-slate-500">
            <FolderOpen className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm font-medium">No projects found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 flex-1">
            {recentProjectsList.map((project: any, i: number) => {
              const colors = ["bg-blue-50 text-blue-500", "bg-emerald-50 text-emerald-500", "bg-orange-50 text-orange-500", "bg-indigo-50 text-indigo-500"];
              const colorClass = colors[i % colors.length];
              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className={`w-11 h-11 ${colorClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-800">
                        {project.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Updated {formatDistanceToNow(new Date(project.updatedAt || Date.now()), { addSuffix: true, locale: id }).replace('sekitar ', '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <StatusBadge status={mapProjectStatus(project.status)} />
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-slate-400 hover:text-slate-700 outline-none p-1 rounded-md hover:bg-slate-200/50 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 shadow-lg p-1">
                        <DropdownMenuItem className="cursor-pointer font-semibold text-[13px] text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 py-2 rounded-lg">
                          <Play className="w-4 h-4 mr-2" /> Start
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-semibold text-[13px] text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 py-2 rounded-lg">
                          <Square className="w-4 h-4 mr-2" /> Stop
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-semibold text-[13px] text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 py-2 rounded-lg">
                          <RefreshCw className="w-4 h-4 mr-2" /> Restart
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer font-semibold text-[13px] text-slate-600 hover:text-blue-600 focus:text-blue-600 focus:bg-blue-50 py-2 rounded-lg">
                          <Rocket className="w-4 h-4 mr-2" /> Deploy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-100 my-1" />
                        <DropdownMenuItem className="cursor-pointer font-semibold text-[13px] text-red-600 hover:text-red-700 focus:text-red-700 focus:bg-red-50 py-2 rounded-lg">
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
