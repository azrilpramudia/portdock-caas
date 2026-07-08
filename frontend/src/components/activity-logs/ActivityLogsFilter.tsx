import { Search, Calendar as CalendarIcon, Download } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface ActivityLogsFilterProps {
  search: string;
  setSearch: (search: string) => void;
  actionFilter: string;
  setActionFilter: (action: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  setCurrentPage: (page: number) => void;
  handleExport: () => void;
}

export function ActivityLogsFilter({
  search,
  setSearch,
  actionFilter,
  setActionFilter,
  statusFilter,
  setStatusFilter,
  date,
  setDate,
  setCurrentPage,
  handleExport
}: ActivityLogsFilterProps) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 p-6 border-b border-border">
      <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
        
        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <input 
            type="text" 
            placeholder="Search activities..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-4 pr-10 py-2.5 bg-muted/50 border border-border text-foreground text-[14px] rounded-xl outline-none focus:border-blue-500 focus:bg-card transition-all font-medium placeholder:text-muted-foreground/70"
          />
          <Search className="w-4 h-4 text-muted-foreground/70 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>

        {/* Action Dropdown */}
        <div className="relative w-full sm:w-[180px]">
          <Select value={actionFilter} onValueChange={(value) => { setActionFilter(value || "All Actions"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full bg-card border-border text-foreground text-[14px] rounded-xl h-11 px-4 font-bold focus:ring-blue-500/20">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="All Actions">All Actions</SelectItem>
              <SelectItem value="Start">Started</SelectItem>
              <SelectItem value="Stop">Stopped</SelectItem>
              <SelectItem value="Create">Created</SelectItem>
              <SelectItem value="Delete">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Picker */}
        <div className="relative w-full sm:w-[260px] xl:w-[280px]">
          <Popover>
            <PopoverTrigger className="w-full flex items-center justify-between bg-card border border-border text-foreground text-[14px] rounded-xl px-4 py-2.5 font-bold cursor-pointer hover:bg-muted transition-colors">
              <span className="truncate">
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span className="text-muted-foreground/80 font-medium">Pick a date range</span>
                  )}
                </span>
              <CalendarIcon className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setCurrentPage(1);
                }}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Status Dropdown */}
        <div className="relative w-full sm:w-[150px]">
          <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value || "All Status"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full bg-card border-border text-foreground text-[14px] rounded-xl h-11 px-4 font-bold focus:ring-blue-500/20">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border bg-card">
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      {/* Export Button */}
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border hover:border-border/80 hover:bg-muted text-foreground rounded-xl text-[14px] font-bold transition-all whitespace-nowrap"
      >
        <Download className="w-4 h-4" />
        Export
      </button>
    </div>
  );
}
