"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatCards } from "@/components/admin/StatCards";
import { ResourceUsage } from "@/components/admin/ResourceUsage";
import { ContainerStatus } from "@/components/admin/ContainerStatus";
import { RecentDeployments } from "@/components/admin/RecentDeployments";
import { RecentActivity } from "@/components/admin/RecentActivity";
import { ServiceStatus } from "@/components/admin/ServiceStatus";

export default function AdminRootPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2026, 4, 26),
    to: new Date(2026, 5, 2), // 2 Jun 2026
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header section with Title and Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Ringkasan keseluruhan sistem Portdock</p>
        </div>
        
        <Popover>
          <PopoverTrigger
            className={cn(
              "flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-muted transition-colors outline-none",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground/80">
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d LLL yyyy", { locale: id })} –{" "}
                      {format(date.to, "d LLL yyyy", { locale: id })}
                    </>
                  ) : (
                    format(date.from, "d LLL yyyy", { locale: id })
                  )
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground/70 ml-2" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={1}
              locale={id}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Top Stats Row */}
      <StatCards />

      {/* Middle Row (Resource & Container Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ResourceUsage />
        </div>
        <div className="lg:col-span-1">
          <ContainerStatus />
        </div>
      </div>

      {/* Bottom Row (Deployments & Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDeployments />
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      {/* Footer Row (Service Status) */}
      <ServiceStatus />
    </div>
  );
}
