import { Search, Filter, Calendar, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ContainerToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  projectFilter: string;
  setProjectFilter: (val: string) => void;
  uniqueProjects: string[];
  userFilter: string;
  setUserFilter: (val: string) => void;
  uniqueUsers: string[];
  dateFilter: string;
  setDateFilter: (val: string) => void;
  setCurrentPage: (val: number) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

export function ContainerToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  projectFilter,
  setProjectFilter,
  uniqueProjects,
  userFilter,
  setUserFilter,
  uniqueUsers,
  dateFilter,
  setDateFilter,
  setCurrentPage,
  activeFilterCount,
  resetFilters
}: ContainerToolbarProps) {
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
      {/* Left: Search */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search containers by name, project, or user..." 
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
              <DropdownMenuItem onClick={() => { setStatusFilter("All Status"); setCurrentPage(1); }}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Running"); setCurrentPage(1); }}>Running</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Stopped"); setCurrentPage(1); }}>Stopped</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Exited"); setCurrentPage(1); }}>Exited</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Project Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Project</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              <span className="truncate max-w-[100px]">{projectFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] max-h-[200px] overflow-y-auto">
              <DropdownMenuItem onClick={() => { setProjectFilter("All Projects"); setCurrentPage(1); }}>All Projects</DropdownMenuItem>
              {uniqueProjects.map(proj => (
                <DropdownMenuItem key={proj} onClick={() => { setProjectFilter(proj); setCurrentPage(1); }}>
                  {proj}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* User Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">User</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              <span className="truncate max-w-[100px]">{userFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] max-h-[200px] overflow-y-auto">
              <DropdownMenuItem onClick={() => { setUserFilter("All Users"); setCurrentPage(1); }}>All Users</DropdownMenuItem>
              {uniqueUsers.map(user => (
                <DropdownMenuItem key={user} onClick={() => { setUserFilter(user); setCurrentPage(1); }}>
                  {user}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Button */}
        <div className="flex flex-col w-[48%] sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                {dateFilter === "ALL" ? "All Time" : dateFilter === "7DAYS" ? "Last 7 Days" : "Last 30 Days"}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuItem onClick={() => { setDateFilter("ALL"); setCurrentPage(1); }}>All Time</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateFilter("7DAYS"); setCurrentPage(1); }}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateFilter("30DAYS"); setCurrentPage(1); }}>Last 30 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Button */}
        <div className="flex flex-col w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={activeFilterCount > 0 ? resetFilters : undefined}
            className={`h-[42px] rounded-lg font-medium px-4 shadow-none ${activeFilterCount > 0 ? 'bg-primary/10 text-primary border-primary/50 hover:bg-primary/20' : 'bg-card border-border text-foreground hover:bg-muted'}`}
          >
            {activeFilterCount > 0 ? (
              <><X className="w-4 h-4 mr-2" /> Clear ({activeFilterCount})</>
            ) : (
              <><Filter className="w-4 h-4 mr-2 text-muted-foreground" /> Filter</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
