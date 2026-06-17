"use client";

import { useState, useEffect } from "react";
import { ChevronDown, RefreshCw, Activity, CheckCircle2, Disc, Hash, Link2, Calendar, ArrowRight, ArrowUp, ArrowDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContainerMonitoring } from "@/hooks/useContainerMonitoring";
import { MonitoringStats } from "@/components/monitoring/MonitoringStats";
import { MonitoringCharts } from "@/components/monitoring/MonitoringCharts";
import { useRouter, useSearchParams } from "next/navigation";

export default function MonitoringIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerIdParam = searchParams.get("containerId");
  
  const [selectedContainerId, setSelectedContainerId] = useState<string>(containerIdParam || "");
  const [isRealTime, setIsRealTime] = useState(true);

  const { data: containersData } = useQuery({
    queryKey: ["containers"],
    queryFn: () => containersService.getContainers(),
  });

  const containers = Array.isArray(containersData) ? containersData : (containersData?.data || []);

  useEffect(() => {
    if (containerIdParam) {
      setSelectedContainerId(containerIdParam);
    } else if (containers.length > 0 && !selectedContainerId) {
      const running = containers.find((c: any) => c.status === "RUNNING");
      setSelectedContainerId(running ? running.id : containers[0].id);
    }
  }, [containers, containerIdParam, selectedContainerId]);

  const {
    cpuPercent,
    memUsageMb,
    memLimitMb,
    memPercent,
    netRxMb,
    netTxMb,
    containerInfo,
    sparklineDataCPU,
    sparklineDataRAM,
    sparklineDataNetwork,
    areaChartData,
    recentLogs,
    handleManualRefresh
  } = useContainerMonitoring(selectedContainerId, isRealTime);

  const selectedContainerDetails = containers.find((c: any) => c.id === selectedContainerId);

  return (
    <div className="space-y-6">
      
      {/* 1. CONTROL HEADER */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold text-muted-foreground mb-2">Container Selection</p>
          <div className="relative w-full md:w-[320px]">
            <Select 
              value={selectedContainerId} 
              onValueChange={(val) => {
                setSelectedContainerId(val);
                handleManualRefresh();
                router.push(`/monitoring?containerId=${val}`);
              }}
            >
              <SelectTrigger className="w-full bg-card border-border text-foreground text-[13px] font-bold rounded-lg h-10 px-3">
                <SelectValue placeholder="Select Container" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border bg-card">
                {containers.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsRealTime(!isRealTime)}
            className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-[13px] font-bold transition-colors ${
              isRealTime 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-muted border-border text-muted-foreground"
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isRealTime ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
            {isRealTime ? "Real-time" : "Paused"}
          </button>
          <button onClick={handleManualRefresh} className="w-10 h-10 flex items-center justify-center rounded-lg bg-card border border-border text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. METRICS CARDS */}
      <MonitoringStats 
        cpuPercent={cpuPercent}
        memPercent={memPercent}
        memUsageMb={memUsageMb}
        memLimitMb={memLimitMb}
        netTxMb={netTxMb}
        netRxMb={netRxMb}
        sparklineDataCPU={sparklineDataCPU}
        sparklineDataRAM={sparklineDataRAM}
        sparklineDataNetwork={sparklineDataNetwork}
      />

      {/* 3. MAIN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonitoringCharts 
          title="CPU Usage (Timeline)"
          dataKey="cpu"
          color="#2563eb"
          gradientId="colorCpu"
          areaChartData={areaChartData} 
        />
        <MonitoringCharts 
          title="RAM Usage (Timeline)"
          dataKey="ram"
          color="#10b981"
          gradientId="colorRam"
          areaChartData={areaChartData} 
        />
      </div>

      {/* 4. BOTTOM PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Container Information */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-[15px] font-bold text-foreground mb-6">Container Information</h3>
          
          <div className="border border-border rounded-xl divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className={`w-4 h-4 ${containerInfo?.status === "RUNNING" ? "text-emerald-500" : "text-red-500"}`} />
                <span className="text-[13px] font-medium text-muted-foreground">Status</span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
                containerInfo?.status === "RUNNING" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              }`}>
                {containerInfo?.status || "Unknown"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Disc className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Image</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.imageName ? `${selectedContainerDetails.imageName}:${selectedContainerDetails.imageTag || 'latest'}` : "-"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Container ID</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">{selectedContainerDetails?.id || "-"}</span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link2 className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Port</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.hostPort ? (
                  <span className="flex items-center gap-1.5">
                    {selectedContainerDetails.hostPort}
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    {selectedContainerDetails.internalPort}
                  </span>
                ) : (selectedContainerDetails?.internalPort || "-")}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-[13px] font-medium text-muted-foreground">Created At</span>
              </div>
              <span className="text-[13px] font-bold text-foreground">
                {selectedContainerDetails?.createdAt ? new Date(selectedContainerDetails.createdAt).toLocaleDateString() : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Resource Logs */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-bold text-foreground">Recent Resource Logs</h3>
          </div>
          
          <div className="overflow-x-auto border border-border rounded-xl h-[268px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-card sticky top-0 z-10 shadow-sm">
                <tr className="border-b border-border text-[12px] font-semibold text-muted-foreground">
                  <th className="px-5 py-3.5 font-medium">Time</th>
                  <th className="px-5 py-3.5 font-medium text-center">CPU (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">RAM (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Disk (%)</th>
                  <th className="px-5 py-3.5 font-medium text-center">Network (MB)</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-foreground divide-y divide-border">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="font-medium text-[13px]">Waiting for real-time data...</p>
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">{log.time}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.cpu}</td>
                      <td className="px-5 py-3.5 text-center font-semibold">{log.ram}</td>
                      <td className="px-5 py-3.5 text-center font-semibold text-muted-foreground">{log.disk} (N/A)</td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          <span className="font-semibold">{log.network}</span>
                          <span className="text-[11px] font-medium text-muted-foreground/70">
                            (↑{log.up} / ↓{log.down})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
