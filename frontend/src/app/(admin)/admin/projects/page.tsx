"use client";

import { useState, useMemo } from "react";
import { useAdminProjects } from "@/hooks/useAdmin";
import { format } from "date-fns";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extracted Components
import { ProjectStats } from "@/components/admin/projects/ProjectStats";
import { AdminDataFilters, FilterValues } from "@/components/admin/AdminDataFilters";
import { ProjectTable } from "@/components/admin/projects/ProjectTable";
import { ViewProjectModal, EditProjectModal, DeleteProjectModal } from "@/components/admin/projects/ProjectModals";

export default function AdminProjectsPage() {
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    projectId: "all",
    userId: "all",
    dateRange: "all",
  });

  const { data: responseData, isLoading } = useAdminProjects();
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortBy, setSortBy] = useState("Newest");
  
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

  const projectOptions = useMemo(() => {
    if (!responseData?.projects) return [{ label: "All Projects", value: "all" }];
    const uniqueProjects = Array.from(new Set(responseData.projects.map(p => p.id)));
    return [
      { label: "All Projects", value: "all" },
      ...uniqueProjects.map(id => {
        const p = responseData.projects.find(p => p.id === id);
        return { label: p?.name || id, value: id };
      })
    ];
  }, [responseData?.projects]);

  const userOptions = useMemo(() => {
    if (!responseData?.projects) return [{ label: "All Users", value: "all" }];
    const uniqueUsers = Array.from(new Set(responseData.projects.map(p => p.user.id)));
    return [
      { label: "All Users", value: "all" },
      ...uniqueUsers.map(id => {
        const p = responseData.projects.find(p => p.user.id === id);
        return { label: p?.user.name || id, value: id };
      })
    ];
  }, [responseData?.projects]);

  // Sort and filter projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.domain && p.domain.toLowerCase().includes(q)) ||
        p.user.name.toLowerCase().includes(q)
      );
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.projectId && filters.projectId !== "all") {
      result = result.filter(p => p.id === filters.projectId);
    }
    if (filters.userId && filters.userId !== "all") {
      result = result.filter(p => p.user.id === filters.userId);
    }

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
  }, [projects, sortBy, filters]);

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
        <AdminDataFilters 
          searchPlaceholder="Search projects by name, domain, or user..."
          statusOptions={[
            { label: "All Status", value: "all" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Failed", value: "FAILED" },
            { label: "Building", value: "BUILDING" }
          ]}
          projectOptions={projectOptions}
          userOptions={userOptions}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            setCurrentPage(1);
          }}
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
