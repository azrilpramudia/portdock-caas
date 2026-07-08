import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ProjectTableProps {
  paginatedProjects: any[];
  filteredProjects: any[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentPage: (val: number) => void;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  onView?: (project: any) => void;
  onEdit?: (project: any) => void;
  onDelete?: (project: any) => void;
}

export function ProjectTable({
  paginatedProjects,
  filteredProjects,
  currentPage,
  itemsPerPage,
  totalPages,
  setCurrentPage,
  handlePrevPage,
  handleNextPage,
  onView,
  onEdit,
  onDelete
}: ProjectTableProps) {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600';
      case 'INACTIVE': return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600';
      case 'FAILED': return 'bg-rose-50 dark:bg-rose-500/10 text-rose-600';
      default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500';
      case 'INACTIVE': return 'bg-amber-500';
      case 'FAILED': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getAvatarInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 
      'bg-amber-500', 'bg-rose-500', 'bg-cyan-600', 'bg-fuchsia-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground bg-muted/50">
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold">Domain</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Containers</th>
              <th className="px-4 py-3 font-semibold">Last Deployment</th>
              <th className="px-4 py-3 font-semibold">Created At</th>
              <th className="px-4 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedProjects.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground font-medium">
                  No projects found.
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project, idx) => {
                const techStack = project.templateId || "Unknown";
                
                return (
                  <tr key={project.id} className="hover:bg-muted/10 transition-colors bg-card">
                    {/* Project Info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ${getAvatarColor(project.name)}`}>
                          {getAvatarInitials(project.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{project.name}</div>
                          <div className="text-[13px] text-muted-foreground mt-0.5 truncate">{techStack}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Owner */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(project.user.name)} text-[11px] font-bold text-white ring-2 ring-background`}>
                          {getAvatarInitials(project.user.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate">{project.user.name}</div>
                          <div className="text-[13px] text-muted-foreground mt-0.5 truncate">{project.user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Domain */}
                    <td className="px-4 py-3">
                      {project.domain ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer min-w-0">
                          <span className="truncate max-w-[100px] lg:max-w-[150px]">{project.domain}</span> <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] ${getStatusColor(project.status)}`}>
                        {project.status === 'INACTIVE' ? (
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(project.status)} animate-pulse`}></div>
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(project.status)}`}></div>
                        )}
                        {project.status === 'ACTIVE' ? 'Active' : project.status === 'INACTIVE' ? 'Inactive' : project.status === 'FAILED' ? 'Failed' : project.status}
                      </div>
                    </td>

                    {/* Containers */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{project._count.containers || 0}</div>
                      <div className="text-[13px] text-muted-foreground mt-0.5">{Math.max(0, (project._count.containers || 0) - (project.status === 'FAILED' ? 1 : 0))} Running</div>
                    </td>

                    {/* Last Deployment */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-muted-foreground">
                        {project.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: id }) : '-'}
                      </div>
                      <div className={`text-[13px] font-medium mt-0.5 flex items-center gap-1.5 ${project.status === 'FAILED' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'FAILED' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                        {project.status === 'FAILED' ? 'Failed' : 'Success'}
                      </div>
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-muted-foreground">{format(new Date(project.createdAt), 'dd MMM yyyy')}</div>
                      <div className="text-[13px] text-muted-foreground mt-0.5">{format(new Date(project.createdAt), 'HH:mm')}</div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TooltipProvider delay={300}>
                          <Tooltip>
                            <TooltipTrigger render={
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-[34px] w-[34px] rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
                                onClick={() => onView && onView(project)}
                              />
                            }>
                              <Eye className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider delay={300}>
                          <Tooltip>
                            <TooltipTrigger render={
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-[34px] w-[34px] rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
                                onClick={() => onEdit && onEdit(project)}
                              />
                            }>
                              <Pencil className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Project</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider delay={300}>
                          <Tooltip>
                            <TooltipTrigger render={
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-[34px] w-[34px] rounded-lg bg-card border-rose-100 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none shrink-0"
                                onClick={() => onDelete && onDelete(project)}
                              />
                            }>
                              <Trash2 className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Project</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Footer */}
      <div className="border-t border-border bg-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredProjects.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Simple page numbers */}
          {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
            <Button 
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="icon" 
              className={`h-8 w-8 rounded-lg font-medium ${currentPage === i + 1 ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
          
          {totalPages > 3 && (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8 bg-card border-border rounded-lg text-muted-foreground" disabled>
                ...
              </Button>
              <Button 
                variant={currentPage === totalPages ? "default" : "outline"}
                size="icon" 
                className={`h-8 w-8 rounded-lg font-medium ${currentPage === totalPages ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent' : 'bg-card border-border text-muted-foreground hover:bg-muted'}`}
                onClick={() => setCurrentPage(totalPages)}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-card border-border rounded-lg hover:bg-muted"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
