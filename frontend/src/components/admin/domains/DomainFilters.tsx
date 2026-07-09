import React from 'react';
import { Search, ChevronDown, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function DomainFilters() {
  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 flex flex-col xl:flex-row flex-wrap gap-4 justify-between items-start xl:items-end mb-6">
      {/* Left: Search Input */}
      <div className="relative w-full flex-1 max-w-[400px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search domains by name or user..." 
          className="pl-10 pr-4 bg-background border-input h-[42px] rounded-md text-sm focus-visible:ring-1 focus-visible:ring-primary/20 transition-all truncate"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[140px] text-foreground">
                <span className="truncate max-w-[150px]">All Status</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[140px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">All Status</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Active</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Expiring Soon</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Expired</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* SSL Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">SSL Status</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[150px] text-foreground">
                <span className="truncate max-w-[150px]">All SSL Status</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[150px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">All SSL Status</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Valid</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Expired</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex flex-col gap-1.5 w-[48%] sm:w-auto">
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 pl-1">Sort By</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="inline-flex items-center justify-between whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-card hover:bg-muted h-[42px] px-4 py-2 min-w-[130px] text-foreground">
                <span className="truncate max-w-[130px]">Newest</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground ml-2 opacity-50 shrink-0" />
              </button>
            } />
            <DropdownMenuContent align="start" className="w-[130px] bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Newest</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Oldest</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-muted font-medium text-sm py-2">Expiring First</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Date Range */}
        <div className="w-[48%] sm:w-auto">
          <Button variant="outline" className="bg-card hover:bg-muted border-border justify-start font-medium h-[42px] w-full text-foreground">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">26 Mei - 2 Jun 2026</span>
            <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50 shrink-0" />
          </Button>
        </div>

        {/* Filter Button */}
        <div className="w-[48%] sm:w-auto">
          <Button variant="outline" className="bg-card hover:bg-muted border-border font-medium h-[42px] w-full text-foreground">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
