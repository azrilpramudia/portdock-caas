import React, { useState } from "react";
import { Search, ChevronDown, Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface FilterValues {
  [key: string]: string;
  search: string;
  status: string;
  projectId: string;
  userId: string;
  dateRange: string;
}

interface AdminDataFiltersProps {
  searchPlaceholder?: string;
  statusOptions?: { label: string; value: string }[];
  projectOptions?: { label: string; value: string }[];
  userOptions?: { label: string; value: string }[];
  onFilterChange: (filters: FilterValues) => void;
}

export function AdminDataFilters({
  searchPlaceholder = "Search...",
  statusOptions = [],
  projectOptions = [],
  userOptions = [],
  onFilterChange,
}: AdminDataFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [userId, setUserId] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const activeFilterCount = (status !== "all" ? 1 : 0) + 
                            (projectId !== "all" ? 1 : 0) + 
                            (userId !== "all" ? 1 : 0) + 
                            (dateRange !== "all" ? 1 : 0) +
                            (search !== "" ? 1 : 0);

  const handleFilter = (updates?: Partial<FilterValues>) => {
    const nextFilters = { search, status, projectId, userId, dateRange, ...updates };
    onFilterChange(nextFilters);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setProjectId("all");
    setUserId("all");
    setDateRange("all");
    onFilterChange({ search: "", status: "all", projectId: "all", userId: "all", dateRange: "all" });
  };

  const getLabel = (options: { label: string; value: string }[], value: string, fallback: string) => {
    return options.find(opt => opt.value === value)?.label || fallback;
  };

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end">
      {/* Left: Search */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilter({ search: e.target.value });
          }}
          className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
        />
      </div>

      {/* Right: Filters */}
      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        {/* Status Dropdown */}
        {statusOptions.length > 0 && (
          <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <span className="truncate max-w-[150px]">{getLabel(statusOptions, status, "All Status")}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl max-h-[300px] overflow-y-auto">
                {statusOptions.map(opt => (
                  <DropdownMenuItem 
                    key={opt.value} 
                    onClick={() => { setStatus(opt.value); handleFilter({ status: opt.value }); }} 
                    className="cursor-pointer hover:bg-muted font-medium text-sm py-2"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Project Dropdown */}
        {projectOptions.length > 0 && (
          <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Project</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <span className="truncate max-w-[150px]">{getLabel(projectOptions, projectId, "All Projects")}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px] bg-card border-border shadow-xl rounded-xl max-h-[300px] overflow-y-auto">
                {projectOptions.map(opt => (
                  <DropdownMenuItem 
                    key={opt.value} 
                    onClick={() => { setProjectId(opt.value); handleFilter({ projectId: opt.value }); }} 
                    className="cursor-pointer hover:bg-muted font-medium text-sm py-2"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* User Dropdown */}
        {userOptions.length > 0 && (
          <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">User</span>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <span className="truncate max-w-[150px]">{getLabel(userOptions, userId, "All Users")}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px] bg-card border-border shadow-xl rounded-xl max-h-[300px] overflow-y-auto">
                {userOptions.map(opt => (
                  <DropdownMenuItem 
                    key={opt.value} 
                    onClick={() => { setUserId(opt.value); handleFilter({ userId: opt.value }); }} 
                    className="cursor-pointer hover:bg-muted font-medium text-sm py-2"
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Date Range Dropdown */}
        <div className="flex flex-col w-[48%] sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                {dateRange === "all" ? "All Time" : dateRange === "7DAYS" ? "Last 7 Days" : "Last 30 Days"}
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem onClick={() => { setDateRange("all"); handleFilter({ dateRange: "all" }); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateRange("7DAYS"); handleFilter({ dateRange: "7DAYS" }); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                Last 7 Days
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setDateRange("30DAYS"); handleFilter({ dateRange: "30DAYS" }); }} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
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
