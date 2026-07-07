"use client";

import { useState, useMemo } from "react";
import { useAdminProjects } from "@/hooks/useAdmin";
import { format } from "date-fns";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extracted Components
import { ProjectStats } from "@/components/admin/projects/ProjectStats";
import { ProjectToolbar } from "@/components/admin/projects/ProjectToolbar";
import { ProjectTable } from "@/components/admin/projects/ProjectTable";
import { ViewProjectModal, EditProjectModal, DeleteProjectModal } from "@/components/admin/projects/ProjectModals";

export default function AdminProjectsPage() {
  const { data: responseData, isLoading } = useAdminProjects();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [ownerFilter, setOwnerFilter] = useState("All Users");
  const [sortBy, setSortBy] = useState("Newest");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, 7DAYS, 30DAYS

  const activeFilterCount = (statusFilter !== "All Status" ? 1 : 0) + 
                            (ownerFilter !== "All Users" ? 1 : 0) + 
                            (dateFilter !== "ALL" ? 1 : 0) + 
                            (searchQuery !== "" ? 1 : 0);

  const resetFilters = () => {
    setStatusFilter("All Status");
    setOwnerFilter("All Users");
    setDateFilter("ALL");
    setSearchQuery("");
    setCurrentPage(1);
  };
  
  // Modal states
  const [isViewProjectOpen, setIsViewProjectOpen] = useState(false);
  const [projectToView, setProjectToView] = useState<any>(null);
  
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  
  const projects = responseData?.projects || [];
  const { 
    totalProjects = 0, 
    activeProjects = 0, 
    pausedProjects = 0, 
    failedProjects = 0, 
    deploymentsToday = 0,
    totalProjectsTrend,
    activeProjectsTrend,
    pausedProjectsTrend,
    failedProjectsTrend,
    deploymentsTrend
  } = responseData?.stats || {};

  const uniqueOwners = useMemo(() => {
    const owners = new Set<string>();
    projects.forEach(p => owners.add(p.user.name));
    return Array.from(owners).sort();
  }, [projects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = projects.filter(project => {
      const matchesSearch = 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.domain && project.domain.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === "All Status" || project.status === statusFilter.toUpperCase();
      const matchesOwner = ownerFilter === "All Users" || project.user.name === ownerFilter;
      
      let matchesDate = true;
      if (dateFilter !== "ALL") {
        const projectDate = new Date(project.createdAt).getTime();
        const now = new Date().getTime();
        const daysDiff = (now - projectDate) / (1000 * 3600 * 24);
        
        if (dateFilter === "7DAYS") matchesDate = daysDiff <= 7;
        if (dateFilter === "30DAYS") matchesDate = daysDiff <= 30;
      }
      
      return matchesSearch && matchesStatus && matchesOwner && matchesDate;
    });

    // Sort projects
    result = result.sort((a, b) => {
      if (sortBy === "Newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "A-Z") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "Z-A") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [projects, searchQuery, statusFilter, ownerFilter, sortBy, dateFilter]);

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

  const handleExport = () => {
    if (!filteredProjects || filteredProjects.length === 0) return;
    const csvRows = [];
    const headers = ['Name', 'Owner', 'Email', 'Domain', 'Status', 'Containers', 'Last Deployment', 'Created At'];
    csvRows.push(headers.join(','));

    for (const project of filteredProjects) {
      const row = [
        `"${project.name}"`,
        `"${project.user.name}"`,
        `"${project.user.email}"`,
        `"${project.domain || ''}"`,
        `"${project.status}"`,
        project._count?.containers || 0,
        `"${project.updatedAt ? format(new Date(project.updatedAt), 'dd MMM yyyy HH:mm') : '-'}"`,
        `"${format(new Date(project.createdAt), 'dd MMM yyyy HH:mm')}"`
      ];
      csvRows.push(row.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portdock_projects_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <ProjectStats 
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        pausedProjects={pausedProjects}
        failedProjects={failedProjects}
        deploymentsToday={deploymentsToday}
        totalProjectsTrend={totalProjectsTrend}
        activeProjectsTrend={activeProjectsTrend}
        pausedProjectsTrend={pausedProjectsTrend}
        failedProjectsTrend={failedProjectsTrend}
        deploymentsTrend={deploymentsTrend}
      />

      <div className="space-y-4">
        <ProjectToolbar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          ownerFilter={ownerFilter}
          setOwnerFilter={setOwnerFilter}
          uniqueOwners={uniqueOwners}
          sortBy={sortBy}
          setSortBy={setSortBy}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          setCurrentPage={setCurrentPage}
          activeFilterCount={activeFilterCount}
          resetFilters={resetFilters}
        />

        <ProjectTable 
          paginatedProjects={paginatedProjects}
          filteredProjects={filteredProjects}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          handlePrevPage={handlePrevPage}
          handleNextPage={handleNextPage}
          onView={(project) => {
            setProjectToView(project);
            setIsViewProjectOpen(true);
          }}
          onEdit={(project) => {
            setProjectToEdit(project);
            setIsEditProjectOpen(true);
          }}
          onDelete={(project) => {
            setProjectToDelete(project);
            setIsDeleteProjectOpen(true);
          }}
        />
      </div>

      <ViewProjectModal 
        isOpen={isViewProjectOpen} 
        onClose={() => setIsViewProjectOpen(false)} 
        project={projectToView} 
      />
      <EditProjectModal 
        isOpen={isEditProjectOpen} 
        onClose={() => setIsEditProjectOpen(false)} 
        project={projectToEdit} 
      />
      <DeleteProjectModal 
        isOpen={isDeleteProjectOpen} 
        onClose={() => setIsDeleteProjectOpen(false)} 
        project={projectToDelete} 
      />
    </div>
  );
}
