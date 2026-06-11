"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Cpu, Database, HardDrive, Network, RefreshCw, Container } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "@/lib/api";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface StatsSnapshot {
  timestamp: string;
  cpuPercent: number;
  memPercent: number;
  netRxMb: number;
  netTxMb: number;
}

function StatCard({
  title,
  value,
  unit,
  percentage,
  color,
  icon: Icon,
  bgColor,
}: {
  title: string;
  value: number | string;
  unit: string;
  percentage?: number;
  color: string;
  icon: any;
  bgColor: string;
}) {
  return (
    <Card className="bg-white border border-slate-200/60 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          {percentage !== undefined && (
            <span className={`text-sm font-bold ${color}`}>{percentage.toFixed(1)}%</span>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-900">
          {typeof value === "number" ? value.toFixed(1) : value}
          <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>
        </p>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
        {percentage !== undefined && (
          <div className="mt-3">
            <Progress value={percentage} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MonitoringPage() {
  const { containerId } = useParams();
  const [history, setHistory] = useState<StatsSnapshot[]>([]);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ["monitoring", containerId],
    queryFn: async () => {
      const res = await api.get(`/monitoring/${containerId}/stats`);
      return res.data;
    },
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (stats) {
      setHistory((prev) => {
        const newEntry: StatsSnapshot = {
          timestamp: format(new Date(), "HH:mm:ss"),
          cpuPercent: stats.cpuPercent,
          memPercent: stats.memPercent,
          netRxMb: stats.netRxMb,
          netTxMb: stats.netTxMb,
        };
        const updated = [...prev, newEntry];
        return updated.slice(-30); // Keep last 30 data points
      });
    }
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/containers">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>
            <p className="text-slate-500 text-sm">
              {stats?.name || "Container"} — Real-time resource monitoring
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard
              title="CPU Usage"
              value={stats?.cpuPercent ?? 0}
              unit="%"
              percentage={stats?.cpuPercent ?? 0}
              icon={Cpu}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="RAM Usage"
              value={`${stats?.memUsageMb ?? 0} / ${stats?.memLimitMb ?? 0}`}
              unit="MB"
              percentage={stats?.memPercent ?? 0}
              icon={Database}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Network RX"
              value={stats?.netRxMb ?? 0}
              unit="MB"
              icon={Network}
              color="text-cyan-600"
              bgColor="bg-cyan-50"
            />
            <StatCard
              title="Network TX"
              value={stats?.netTxMb ?? 0}
              unit="MB"
              icon={HardDrive}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
          </div>

          {/* Charts */}
          {history.length > 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU Chart */}
              <Card className="bg-white border border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-500" />
                    CPU Usage (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "CPU"]}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cpuPercent"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                        name="CPU"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Memory Chart */}
              <Card className="bg-white border border-slate-200/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Database className="w-4 h-4 text-green-500" />
                    RAM Usage (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(v: any) => [`${Number(v).toFixed(2)}%`, "RAM"]}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="memPercent"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="RAM"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Network Chart */}
              <Card className="bg-white border border-slate-200/60 shadow-sm lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Network className="w-4 h-4 text-cyan-500" />
                    Network I/O (MB)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="netRxMb"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={false}
                        name="RX (MB)"
                      />
                      <Line
                        type="monotone"
                        dataKey="netTxMb"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                        name="TX (MB)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {history.length <= 1 && (
            <Card className="bg-white border border-slate-200/60 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-slate-500">Mengumpulkan data monitoring...</p>
                <p className="text-xs text-slate-400 mt-1">Chart akan muncul setelah beberapa detik</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
