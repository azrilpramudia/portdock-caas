import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Eye, Pencil, Rocket, Trash2, MoreHorizontal, Loader2, ExternalLink, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProjectIcon, getDeployTypeDetails } from "@/utils/icon-helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSettingsStore } from "@/store/settings";

interface ProjectTableProps {
  isLoading: boolean;
  projects: any[];
  setDeleteId: (id: string) => void;
}

function getStatusBadge(project: any) {
  let status = project.status;
  
  // If project is ACTIVE, but all containers are stopped, consider it INACTIVE
  if (status === "ACTIVE" && project.containers && project.containers.length > 0) {
    const allStopped = project.containers.every((c: any) => c.status === "STOPPED");
    if (allStopped) {
      status = "INACTIVE";
    }
  }

  let label = status;
  let dotColor = "bg-slate-500";
  let badgeColor = "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
  
  switch(status) {
    case "ACTIVE":
    case "DEPLOYED":
      label = "Running";
      dotColor = "bg-emerald-500";
      badgeColor = "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
      break;
    case "INACTIVE":
    case "STOPPED":
      label = "Stopped";
      dotColor = "bg-slate-500";
      badgeColor = "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
      break;
    case "BUILDING":
      label = "Building";
      dotColor = "bg-amber-500";
      badgeColor = "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
      break;
    case "FAILED":
    case "ERROR":
      label = "Failed";
      dotColor = "bg-red-500";
      badgeColor = "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400";
      break;
    default:
      label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Unknown";
      dotColor = "bg-slate-500";
      badgeColor = "bg-slate-50 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400";
  }
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </div>
  );
}

export function ProjectTable({ isLoading, projects, setDeleteId }: ProjectTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { settings } = useSettingsStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">No projects found</h3>
        <p className="text-muted-foreground text-[13px] mb-6 max-w-sm leading-relaxed">
          You haven't created any deployment projects yet. Get started by creating your first project.
        </p>
        {settings.isMaintenanceMode ? (
          <Button disabled className="bg-muted text-muted-foreground font-semibold h-10 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
            <Plus className="w-4 h-4 mr-2" /> Create First Project
          </Button>
        ) : (
          <Link href="/projects/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-6 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]">
              <Plus className="w-4 h-4 mr-2" /> Create First Project
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
            <th className="px-6 py-3 font-semibold">Project Name</th>
            <th className="px-6 py-3 font-semibold">Type</th>
            <th className="px-6 py-3 font-semibold">Domain</th>
            <th className="px-6 py-3 font-semibold">Status</th>
            <th className="px-6 py-3 font-semibold">Last Updated</th>
            <th className="px-6 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {projects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((project: any) => {
            const iconStyle = getProjectIcon(project.name);
            const ProjectIcon = iconStyle.icon;
            const iconColor = `${iconStyle.bg} ${iconStyle.text}`;
            const typeDetails = getDeployTypeDetails(project.deploymentType || "ZIP");
            const displayDomain = project.domain || `${project.name.toLowerCase().replace(/\s+/g, '-')}.portdock.id`;

            return (
              <tr key={project.id} className="hover:bg-muted/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${iconColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
                      <ProjectIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-foreground">{project.name}</p>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{project.description || "No description provided"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <typeDetails.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-foreground">{typeDetails.label}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <a 
                    href={`http://${displayDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-blue-600 transition-colors"
                  >
                    {displayDomain}
                    <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(project)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[13px] text-muted-foreground font-medium">
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: id }).replace('sekitar ', '')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground text-[12px] font-semibold shadow-sm">
                        <Eye className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> View
                      </Button>
                    </Link>
                    <Link href={`/projects/${project.id}/settings`}>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-border text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm">
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 p-0 rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground shadow-sm outline-none transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-border">
                        {settings.isMaintenanceMode ? (
                          <DropdownMenuItem disabled className="cursor-pointer text-muted-foreground font-medium focus:text-muted-foreground">
                            <Rocket className="w-4 h-4 mr-2 text-muted-foreground" /> Deploy
                          </DropdownMenuItem>
                        ) : (
                          <Link href={`/projects/${project.id}/deploy`}>
                            <DropdownMenuItem className="cursor-pointer text-foreground font-medium focus:text-foreground">
                              <Rocket className="w-4 h-4 mr-2 text-muted-foreground" /> Deploy
                            </DropdownMenuItem>
                          </Link>
                        )}
                        <DropdownMenuSeparator className="bg-border my-1" />
                        <DropdownMenuItem
                          disabled={settings.isMaintenanceMode}
                          className={`cursor-pointer font-medium ${settings.isMaintenanceMode ? 'text-muted-foreground' : 'text-red-600 hover:text-red-700 focus:text-red-700 focus:bg-red-500/10'}`}
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
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="text-[13px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, projects.length)}</span> of <span className="font-medium text-foreground">{projects.length}</span> projects
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 text-[13px]"
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(projects.length / itemsPerPage) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-md text-[13px] font-medium transition-colors ${
                    currentPage === i + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(projects.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(projects.length / itemsPerPage)}
              className="h-8 text-[13px]"
            >
              Next
            </Button>
          </div>
        </div>
    </div>
  );
}
