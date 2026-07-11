"use client";

import React, { useMemo } from 'react';
import { Plus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DomainStats } from '@/components/admin/domains/DomainStats';
import { DomainFilters } from '@/components/admin/domains/DomainFilters';
import { DomainTable } from '@/components/admin/domains/DomainTable';
import { useAdminProjects } from '@/hooks/useAdminProjects';
import { ViewProjectModal, DeleteProjectModal } from "@/components/admin/projects/ProjectModals";
import { EditDomainModal } from "@/components/admin/domains/DomainModals";

export default function AdminDomainsPage() {
  const { data: responseData, isLoading } = useAdminProjects();
  
  // Local state for UI components
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('All Status');
  const [sslStatusFilter, setSslStatusFilter] = React.useState('All SSL Status');
  const [sortBy, setSortBy] = React.useState('Newest');
  const [dateRange, setDateRange] = React.useState('All Time');

  // Modal states
  const [domainToView, setDomainToView] = React.useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [domainToEdit, setDomainToEdit] = React.useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [domainToDelete, setDomainToDelete] = React.useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const handleClear = () => {
    setSearchQuery('');
    setStatusFilter('All Status');
    setSslStatusFilter('All SSL Status');
    setSortBy('Newest');
    setDateRange('All Time');
  };

  const rawDomains = useMemo(() => {
    if (!responseData?.projects) return [];
    return responseData.projects.filter(p => p.domain);
  }, [responseData?.projects]);

  const filteredDomains = useMemo(() => {
    let result = [...rawDomains];

    // Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(d => 
        (d.name?.toLowerCase().includes(lowerQuery)) ||
        (d.domain?.toLowerCase().includes(lowerQuery)) ||
        (d.user?.name?.toLowerCase().includes(lowerQuery)) ||
        (d.user?.email?.toLowerCase().includes(lowerQuery))
      );
    }

    // Status Filter
    if (statusFilter !== 'All Status') {
      if (statusFilter === 'Active') {
        result = result.filter(d => d.status === 'ACTIVE');
      } else if (statusFilter === 'Expiring Soon') {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        result = result.filter(d => {
          if (!d.sslExpiresAt) return false;
          const expiresAt = new Date(d.sslExpiresAt);
          return expiresAt > now && expiresAt <= thirtyDaysFromNow;
        });
      } else if (statusFilter === 'Expired') {
        const now = new Date();
        result = result.filter(d => {
          if (!d.sslExpiresAt) return false;
          const expiresAt = new Date(d.sslExpiresAt);
          return expiresAt <= now;
        });
      }
    }

    // SSL Status Filter
    if (sslStatusFilter !== 'All SSL Status') {
      if (sslStatusFilter === 'Valid') {
        result = result.filter(d => d.status === 'ACTIVE');
      } else if (sslStatusFilter === 'Unknown') {
        result = result.filter(d => d.status !== 'ACTIVE');
      }
    }

    // Date Range Filter
    if (dateRange !== 'All Time') {
      const now = new Date();
      let limitDate = new Date();
      if (dateRange === 'Today') {
        limitDate.setHours(0, 0, 0, 0);
      } else if (dateRange === 'Last 7 Days') {
        limitDate.setDate(now.getDate() - 7);
      } else if (dateRange === 'Last 30 Days') {
        limitDate.setDate(now.getDate() - 30);
      }
      
      result = result.filter(d => {
        const createdAt = new Date(d.createdAt);
        return createdAt >= limitDate;
      });
    }

    // Sort By
    if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'Oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'Expiring First') {
      result.sort((a, b) => {
        const dateA = a.sslExpiresAt ? new Date(a.sslExpiresAt).getTime() : Infinity;
        const dateB = b.sslExpiresAt ? new Date(b.sslExpiresAt).getTime() : Infinity;
        return dateA - dateB;
      });
    }

    return result;
  }, [rawDomains, searchQuery, statusFilter, sslStatusFilter, sortBy, dateRange]);

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Domains</h1>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <span className="hover:text-primary transition-colors cursor-pointer">Dashboard</span>
            <span>&gt;</span>
            <span className="text-foreground">Domains</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Domain
          </button>
        </div>
      </div>

      <DomainStats domains={rawDomains} />
      
      <DomainFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sslStatusFilter={sslStatusFilter}
        setSslStatusFilter={setSslStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onClear={handleClear}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DomainTable 
          domains={filteredDomains} 
          onView={(domain) => {
            setDomainToView(domain);
            setIsViewModalOpen(true);
          }}
          onEdit={(domain) => {
            setDomainToEdit(domain);
            setIsEditModalOpen(true);
          }}
          onDelete={(domain) => {
            setDomainToDelete(domain);
            setIsDeleteModalOpen(true);
          }}
        />
      )}
      
      <ViewProjectModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        project={domainToView} 
      />
      <EditDomainModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        domain={domainToEdit} 
      />
      <DeleteProjectModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        project={domainToDelete} 
      />
    </div>
  );
}
