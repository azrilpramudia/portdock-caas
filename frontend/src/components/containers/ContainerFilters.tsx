import React from "react";
import { Search, Filter, Box, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ContainerFiltersProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  projectFilter: string;
  setProjectFilter: (value: string) => void;
  setCurrentPage: (page: number) => void;
  uniqueProjects: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ContainerFilters({
  search,
  onSearchChange,
  statusFilter,
  setStatusFilter,
  projectFilter,
  setProjectFilter,
  setCurrentPage,
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
      
      {/* Status Filter */}
      <div className="relative w-full sm:w-[160px]">
        <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val || "all"); setCurrentPage(1); }}>
          <SelectTrigger className="w-full bg-card border-border text-foreground text-[14px] rounded-xl h-11 px-4 font-bold focus:ring-blue-500/20">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="All Status">All Status</SelectItem>
            <SelectItem value="Running">Running</SelectItem>
            <SelectItem value="Stopped">Stopped</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Filter */}
      <div className="relative w-full sm:w-[180px]">
        <Select value={projectFilter} onValueChange={(val) => { setProjectFilter(val || "all"); setCurrentPage(1); }}>
          <SelectTrigger className="w-full bg-card border-border text-foreground text-[14px] rounded-xl h-11 px-4 font-bold focus:ring-blue-500/20">
            <div className="flex items-center gap-2">
              <Box className="w-3.5 h-3.5 text-muted-foreground" />
              <SelectValue placeholder="All Projects" />
            </div>
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border bg-card">
            <SelectItem value="All Projects">All Projects</SelectItem>
            {uniqueProjects.map((projectName: string) => (
              <SelectItem key={projectName} value={projectName}>
                {projectName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
