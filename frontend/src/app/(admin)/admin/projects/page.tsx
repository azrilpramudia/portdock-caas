"use client";

import { useState, useMemo } from "react";
import { useAdminProjects, AdminProjectListItemDto } from "@/hooks/useAdmin";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { 
  Folder, ClipboardCheck, PauseCircle, XCircle, Rocket,
  Search, Filter, Plus, Download,
  Eye, Pencil, Trash2, Loader2, Calendar, ChevronDown,
  ChevronLeft, ChevronRight, ExternalLink, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminProjectsPage() {
  const { data: responseData, isLoading } = useAdminProjects();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const projects = responseData?.projects || [];
  const { 
    totalProjects = 0, 
    activeProjects = 0, 
    pausedProjects = 0, 
    failedProjects = 0, 
    deploymentsToday = 0 
  } = responseData?.stats || {};

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.domain && project.domain.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "All Status" || project.status === statusFilter.toUpperCase();
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Dashboard</Link>
            <span>&gt;</span>
            <span className="text-foreground">Projects</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 shrink-0">
              <Folder className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
              <h3 className="text-2xl font-bold mt-1">{totalProjects}</h3>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 12% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500 shrink-0">
              <ClipboardCheck className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold mt-1">{activeProjects}</h3>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 8% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-amber-500">
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="M10 15V9M14 15V9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inactive Projects</p>
              <h3 className="text-2xl font-bold mt-1">{pausedProjects}</h3>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 33% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="w-6 h-6 text-rose-500">
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed Projects</p>
              <h3 className="text-2xl font-bold mt-1">{failedProjects}</h3>
              <p className="text-xs font-medium text-rose-500 mt-1 flex items-center">
                ↓ 11% <span className="text-muted-foreground font-normal ml-1">dari minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-500 shrink-0">
              <Rocket className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deployments Today</p>
              <h3 className="text-2xl font-bold mt-1">{deploymentsToday}</h3>
              <p className="text-xs font-medium text-emerald-500 mt-1 flex items-center">
                ↑ 14% <span className="text-muted-foreground font-normal ml-1">dari kemarin</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        {/* Toolbar Box */}
        <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
          {/* Left: Search */}
          <div className="relative w-full flex-1 max-w-[400px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects by name, owner, or domain..." 
              className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          
          {/* Right: Filters */}
          <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
            {/* Status Dropdown */}
            <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                  {statusFilter} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px]">
                  <DropdownMenuItem onClick={() => setStatusFilter("All Status")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Paused")}>Paused</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Failed")}>Failed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Owner Dropdown */}
            <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Owner</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                  All Users <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px]">
                  <DropdownMenuItem>All Users</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Sort By Dropdown */}
            <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Sort By</span>
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                  Newest <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[140px]">
                  <DropdownMenuItem>Newest</DropdownMenuItem>
                  <DropdownMenuItem>Oldest</DropdownMenuItem>
                  <DropdownMenuItem>A-Z</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date Range Button */}
            <div className="flex flex-col w-[48%] sm:w-auto">
              <Button variant="outline" className="bg-card border-border h-[42px] rounded-lg font-medium text-muted-foreground px-4 hover:bg-muted shadow-none">
                <Calendar className="w-4 h-4 mr-2" /> 26 Mei - 2 Jun 2026 <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Filter Button */}
            <div className="flex flex-col w-full sm:w-auto">
              <Button variant="outline" className="bg-card border-border h-[42px] rounded-lg font-medium text-foreground px-4 hover:bg-muted shadow-none">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                          <Badge variant="outline" className={`font-semibold border-0 gap-1.5 px-2.5 py-1 ${getStatusColor(project.status)}`}>
                            {project.status === 'FAILED' ? (
                              <X className="w-2.5 h-2.5 stroke-[3.5]" />
                            ) : (
                              <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(project.status)}`}></span>
                            )}
                            {project.status === 'ACTIVE' ? 'Active' : project.status === 'INACTIVE' ? 'Inactive' : project.status === 'FAILED' ? 'Failed' : project.status}
                          </Badge>
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
                            <Button variant="outline" size="icon" className="h-[34px] w-[34px] rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-[34px] w-[34px] rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-[34px] w-[34px] rounded-lg bg-card border-rose-100 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none shrink-0">
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
      </div>
    </div>
  );
}
