"use client";

import React from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DomainStats } from '@/components/admin/domains/DomainStats';
import { DomainFilters } from '@/components/admin/domains/DomainFilters';
import { DomainTable } from '@/components/admin/domains/DomainTable';

export default function AdminDomainsPage() {
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

      <DomainStats />
      
      <DomainFilters />
      
      <DomainTable />
      
    </div>
  );
}
