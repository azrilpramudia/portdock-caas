import { Search, Filter, Calendar, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ProjectToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  ownerFilter: string;
  setOwnerFilter: (val: string) => void;
  uniqueOwners: string[];
  sortBy: string;
  setSortBy: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  setCurrentPage: (val: number) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

export function ProjectToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  ownerFilter,
  setOwnerFilter,
  uniqueOwners,
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter,
  setCurrentPage,
  activeFilterCount,
  resetFilters
}: ProjectToolbarProps) {
  return (
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
              <DropdownMenuItem onClick={() => { setStatusFilter("All Status"); setCurrentPage(1); }}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Active"); setCurrentPage(1); }}>Active</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Inactive"); setCurrentPage(1); }}>Inactive</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("Failed"); setCurrentPage(1); }}>Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Owner Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Owner</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              <span className="truncate max-w-[100px]">{ownerFilter}</span> <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] max-h-[200px] overflow-y-auto">
              <DropdownMenuItem onClick={() => { setOwnerFilter("All Users"); setCurrentPage(1); }}>All Users</DropdownMenuItem>
              {uniqueOwners.map(owner => (
                <DropdownMenuItem key={owner} onClick={() => { setOwnerFilter(owner); setCurrentPage(1); }}>
                  {owner}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Sort By</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              {sortBy} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px]">
              <DropdownMenuItem onClick={() => { setSortBy("Newest"); setCurrentPage(1); }}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("Oldest"); setCurrentPage(1); }}>Oldest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("A-Z"); setCurrentPage(1); }}>A-Z</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setSortBy("Z-A"); setCurrentPage(1); }}>Z-A</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Dropdown */}
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
