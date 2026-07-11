import React from 'react';
import { Search, ChevronDown, Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export interface DomainFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sslStatusFilter: string;
  setSslStatusFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  dateRange: string;
  setDateRange: (val: string) => void;
  onClear: () => void;
}

export function DomainFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sslStatusFilter,
  setSslStatusFilter,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  onClear,
}: DomainFiltersProps) {

  const activeFilterCount = (statusFilter !== "All Status" ? 1 : 0) + 
                            (sslStatusFilter !== "All SSL Status" ? 1 : 0) + 
                            (sortBy !== "Newest" ? 1 : 0) + 
                            (dateRange !== "All Time" ? 1 : 0) +
                            (searchQuery !== "" ? 1 : 0);

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end mb-6">
      {/* Left: Search Input */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search domains by name or user..." 
          className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <span className="truncate max-w-[150px]">{statusFilter}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              {['All Status', 'Active', 'Expiring Soon', 'Expired'].map(status => (
                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* SSL Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">SSL Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[150px] text-foreground">
                <span className="truncate max-w-[150px]">{sslStatusFilter}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[150px] bg-card border-border shadow-xl rounded-xl">
              {['All SSL Status', 'Valid', 'Unknown'].map(status => (
                <DropdownMenuItem key={status} onClick={() => setSslStatusFilter(status)} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Sort By</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[130px] text-foreground">
                <span className="truncate max-w-[130px]">{sortBy}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[130px] bg-card border-border shadow-xl rounded-xl">
              {['Newest', 'Oldest', 'Expiring First'].map(sort => (
                <DropdownMenuItem key={sort} onClick={() => setSortBy(sort)} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  {sort}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button variant="outline" className="bg-card hover:bg-muted border-border justify-start font-medium h-[42px] w-full text-foreground px-4">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate max-w-[120px] text-left">{dateRange}</span>
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
              </Button>
            } />
            <DropdownMenuContent align="start" className="w-[160px] bg-card border-border shadow-xl rounded-xl">
              {['All Time', 'Today', 'Last 7 Days', 'Last 30 Days'].map(range => (
                <DropdownMenuItem key={range} onClick={() => setDateRange(range)} className="cursor-pointer hover:bg-muted font-medium text-sm py-2">
                  {range}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Filter Button */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto justify-end">
          <Button 
            onClick={activeFilterCount > 0 ? onClear : undefined} 
            variant="outline" 
            className={`font-medium h-[42px] w-full px-4 shadow-none ${activeFilterCount > 0 ? 'bg-primary/10 text-primary border-primary/50 hover:bg-primary/20 hover:text-primary' : 'bg-card border-border text-foreground hover:bg-muted'}`}
          >
            {activeFilterCount > 0 ? (
              <><X className="mr-2 h-4 w-4" /> Clear ({activeFilterCount})</>
            ) : (
              <><Filter className="mr-2 h-4 w-4 text-muted-foreground" /> Filter</>
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
