import React from "react";
import { Search, ChevronDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContainerFiltersProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  onStatusFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  projectFilter: string;
  onProjectFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  uniqueProjects: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ContainerFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  projectFilter,
  onProjectFilterChange,
  uniqueProjects,
  isLoading,
  onRefresh,
}: ContainerFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full sm:max-w-[320px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70" />
        <input 
          type="text" 
          placeholder="Search containers..." 
          value={search}
          onChange={onSearchChange}
          className="w-full h-[38px] pl-10 pr-4 text-[13px] bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-muted-foreground/70"
        />
      </div>
      
      <div className="relative w-full sm:w-44">
        <select 
          value={statusFilter}
          onChange={onStatusFilterChange}
          className="w-full h-[38px] pl-10 pr-8 text-[13px] font-medium text-foreground bg-card border border-border rounded-xl appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
        >
          <option value="All Status">All Status</option>
          <option value="Running">Running</option>
          <option value="Stopped">Stopped</option>
          <option value="Failed">Failed</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
      </div>

      <div className="relative w-full sm:w-44">
        <select 
          value={projectFilter}
          onChange={onProjectFilterChange}
          className="w-full h-[38px] pl-10 pr-8 text-[13px] font-medium text-foreground bg-card border border-border rounded-xl appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
        >
          <option value="All Projects">All Projects</option>
          {uniqueProjects.map((proj) => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/70 pointer-events-none" />
      </div>

      <div className="flex-1 hidden sm:block" />

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button onClick={onRefresh} className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px] font-bold transition-all flex-1 sm:flex-none">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>
    </div>
  );
}
