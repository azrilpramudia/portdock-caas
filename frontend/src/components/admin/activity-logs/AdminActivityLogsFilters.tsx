import React from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminActivityLogsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userFilter: string;
  setUserFilter: (user: string) => void;
  actionFilter: string;
  setActionFilter: (action: string) => void;
  resourceFilter: string;
  setResourceFilter: (resource: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateRange: string;
  setDateRange: (range: string) => void;
  setCurrentPage: (page: number) => void;
  uniqueUsers: string[];
  uniqueActions: string[];
  uniqueResources: string[];
  uniqueStatuses: string[];
}

export function AdminActivityLogsFilters({
  searchQuery,
  setSearchQuery,
  userFilter,
  setUserFilter,
  actionFilter,
  setActionFilter,
  resourceFilter,
  setResourceFilter,
  statusFilter,
  setStatusFilter,
  setCurrentPage,
  uniqueUsers,
  uniqueActions,
  uniqueResources,
  uniqueStatuses,
}: AdminActivityLogsFiltersProps) {
  // We can omit dateRange from activeFilterCount because it's in the header, or include it if reset affects it.
  const activeFilterCount = (userFilter !== "all" ? 1 : 0) +
                            (actionFilter !== "all" ? 1 : 0) +
                            (resourceFilter !== "all" ? 1 : 0) +
                            (statusFilter !== "all" ? 1 : 0);

  const resetFilters = () => {
    setSearchQuery("");
    setUserFilter("all");
    setActionFilter("all");
    setResourceFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
      {/* Left: Search */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search activities by user, action, resource..." 
          className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        />
      </div>
      
      {/* Right: Filters */}
      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">User</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="justify-between h-[42px] bg-card hover:bg-muted border-border text-foreground font-normal px-4 py-2 min-w-[140px]">
                <span className="truncate">{userFilter === "all" ? "All Users" : userFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-[160px]">
              <DropdownMenuItem onClick={() => { setUserFilter("all"); setCurrentPage(1); }}>All Users</DropdownMenuItem>
              {uniqueUsers.map(u => (
                <DropdownMenuItem key={u} onClick={() => { setUserFilter(u); setCurrentPage(1); }}>{u}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Action</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="justify-between h-[42px] bg-card hover:bg-muted border-border text-foreground font-normal px-4 py-2 min-w-[140px]">
                <span className="truncate">{actionFilter === "all" ? "All Actions" : actionFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-[160px]">
              <DropdownMenuItem onClick={() => { setActionFilter("all"); setCurrentPage(1); }}>All Actions</DropdownMenuItem>
              {uniqueActions.map(a => (
                <DropdownMenuItem key={a} onClick={() => { setActionFilter(a); setCurrentPage(1); }}>{a}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Resource Type</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="justify-between h-[42px] bg-card hover:bg-muted border-border text-foreground font-normal px-4 py-2 min-w-[140px]">
                <span className="truncate">{resourceFilter === "all" ? "All Resources" : resourceFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-[160px]">
              <DropdownMenuItem onClick={() => { setResourceFilter("all"); setCurrentPage(1); }}>All Resources</DropdownMenuItem>
              {uniqueResources.map(r => (
                <DropdownMenuItem key={r} onClick={() => { setResourceFilter(r); setCurrentPage(1); }}>{r}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="justify-between h-[42px] bg-card hover:bg-muted border-border text-foreground font-normal px-4 py-2 min-w-[140px]">
                <span className="truncate">{statusFilter === "all" ? "All Status" : statusFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-[160px]">
              <DropdownMenuItem onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}>All Status</DropdownMenuItem>
              {uniqueStatuses.map(s => (
                <DropdownMenuItem key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col w-[48%] sm:w-auto">
          {activeFilterCount > 0 ? (
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="h-[42px] text-muted-foreground hover:text-foreground px-3"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="h-[42px] bg-background border-input text-muted-foreground px-4 w-full sm:w-auto justify-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
