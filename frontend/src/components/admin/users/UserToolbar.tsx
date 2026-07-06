import { Search, Filter, Calendar, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  roleFilter: string;
  setRoleFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dateFilter: string;
  setDateFilter: (val: string) => void;
  setCurrentPage: (val: number) => void;
  activeFilterCount: number;
  resetFilters: () => void;
}

export function UserToolbar({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  setCurrentPage,
  activeFilterCount,
  resetFilters
}: UserToolbarProps) {
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
      {/* Left: Search */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search users by name or email..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
        />
      </div>
      
      {/* Right: Filters */}
      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        {/* Role Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Role</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              {roleFilter} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => { setRoleFilter("All Roles"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setRoleFilter("USER"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                USER
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setRoleFilter("ADMIN"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                ADMIN
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              {statusFilter === "All Status" ? "All Status" : statusFilter === "ACTIVE" ? "Active" : "Suspended"} <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => { setStatusFilter("All Status"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("ACTIVE"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                Active
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setStatusFilter("SUSPENDED"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                Suspended
              </DropdownMenuItem>
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
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => { setDateFilter("ALL"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateFilter("7DAYS"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateFilter("30DAYS"); setCurrentPage(1); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                Last 30 Days
              </DropdownMenuItem>
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
