import { Search, ChevronDown, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeploymentFilters() {
  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 bg-card border border-border rounded-2xl shadow-sm">
      {/* Search Bar */}
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search deployments by project, user, or domain..."
          className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-xl text-[14px] font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap lg:flex-nowrap gap-3 items-center">
        {/* Status */}
        <div className="flex flex-col flex-1 lg:flex-none lg:w-40 min-w-[120px]">
          <span className="text-[11px] font-bold text-muted-foreground mb-1 ml-1 uppercase tracking-wider">Status</span>
          <button className="flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-[13px] font-semibold text-foreground hover:bg-muted transition-colors">
            <span>All Status</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Project */}
        <div className="flex flex-col flex-1 lg:flex-none lg:w-44 min-w-[120px]">
          <span className="text-[11px] font-bold text-muted-foreground mb-1 ml-1 uppercase tracking-wider">Project</span>
          <button className="flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-[13px] font-semibold text-foreground hover:bg-muted transition-colors">
            <span>All Projects</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* User */}
        <div className="flex flex-col flex-1 lg:flex-none lg:w-40 min-w-[120px]">
          <span className="text-[11px] font-bold text-muted-foreground mb-1 ml-1 uppercase tracking-wider">User</span>
          <button className="flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-[13px] font-semibold text-foreground hover:bg-muted transition-colors">
            <span>All Users</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Date Range */}
        <div className="flex flex-col flex-1 lg:flex-none lg:w-56 min-w-[200px]">
          <span className="text-[11px] font-bold text-muted-foreground mb-1 ml-1 opacity-0 hidden lg:block">Date Range</span>
          <button className="flex items-center justify-between px-4 py-2.5 bg-background border border-border rounded-xl text-[13px] font-semibold text-foreground hover:bg-muted transition-colors h-[42px] mt-auto">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span>26 Mei - 2 Jun 2026</span>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Filter Button */}
        <div className="flex flex-col flex-1 lg:flex-none">
          <span className="text-[11px] font-bold text-muted-foreground mb-1 ml-1 opacity-0 hidden lg:block">Action</span>
          <Button variant="outline" className="h-[42px] px-5 rounded-xl bg-background border-border text-foreground font-bold hover:bg-muted mt-auto shadow-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
