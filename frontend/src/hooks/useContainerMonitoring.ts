import { useState, useEffect } from "react";
import { monitoringService } from "@/services/monitoring.service";

export type DataPoint = { time: string; value: number };
export type AreaDataPoint = { time: string; cpu: number; ram: number };
export type LogDataPoint = { time: string; cpu: number; ram: number; disk: number; network: number; up: number; down: number };

export function useContainerMonitoring(selectedContainerId: string, isRealTime: boolean) {
  const [cpuPercent, setCpuPercent] = useState(0);
  const [memUsageMb, setMemUsageMb] = useState(0);
  const [memLimitMb, setMemLimitMb] = useState(0);
  const [memPercent, setMemPercent] = useState(0);
  const [netRxMb, setNetRxMb] = useState(0);
  const [netTxMb, setNetTxMb] = useState(0);
  const [containerInfo, setContainerInfo] = useState<any>(null);

  const [sparklineDataCPU, setSparklineDataCPU] = useState<DataPoint[]>([]);
  const [sparklineDataRAM, setSparklineDataRAM] = useState<DataPoint[]>([]);
  const [sparklineDataNetwork, setSparklineDataNetwork] = useState<DataPoint[]>([]);
  const [areaChartData, setAreaChartData] = useState<AreaDataPoint[]>([]);
  const [recentLogs, setRecentLogs] = useState<LogDataPoint[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStats = async () => {
      if (!selectedContainerId) return;

      try {
        const stats = await monitoringService.getContainerStats(selectedContainerId);
        
        const timeStr = new Date(stats.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setCpuPercent(stats.cpuPercent || 0);
        setMemUsageMb(stats.memUsageMb || 0);
        setMemLimitMb(stats.memLimitMb || 0);
        setMemPercent(stats.memPercent || 0);
        setNetRxMb(stats.netRxMb || 0);
        setNetTxMb(stats.netTxMb || 0);
        setContainerInfo(stats);

        const newCpuPoint = { time: timeStr, value: stats.cpuPercent || 0 };
        const newRamPoint = { time: timeStr, value: stats.memPercent || 0 };
        const totalNet = parseFloat(((stats.netRxMb || 0) + (stats.netTxMb || 0)).toFixed(2));
        const newNetPoint = { time: timeStr, value: totalNet };
        
        const newAreaPoint = { time: timeStr, cpu: stats.cpuPercent || 0, ram: stats.memPercent || 0 };
        
        const newLog: LogDataPoint = { 
          time: timeStr, 
          cpu: stats.cpuPercent || 0, 
          ram: stats.memPercent || 0, 
          disk: 0, 
          network: totalNet,
          up: stats.netTxMb || 0,
          down: stats.netRxMb || 0
        };

        setSparklineDataCPU(prev => [...prev.slice(-20), newCpuPoint]);
        setSparklineDataRAM(prev => [...prev.slice(-20), newRamPoint]);
        setSparklineDataNetwork(prev => [...prev.slice(-20), newNetPoint]);
        setAreaChartData(prev => [...prev.slice(-30), newAreaPoint]);
        setRecentLogs(prev => [newLog, ...prev.slice(0, 9)]);

      } catch (err) {
        console.error("Failed to fetch container stats", err);
      }
    };

    if (isRealTime && selectedContainerId) {
      fetchStats();
      intervalId = setInterval(fetchStats, 3000);
    }

    return () => clearInterval(intervalId);
  }, [selectedContainerId, isRealTime]);

  const handleManualRefresh = () => {
    setSparklineDataCPU([]);
    setSparklineDataRAM([]);
    setSparklineDataNetwork([]);
    setAreaChartData([]);
    setRecentLogs([]);
  };

  return {
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
  };
}
