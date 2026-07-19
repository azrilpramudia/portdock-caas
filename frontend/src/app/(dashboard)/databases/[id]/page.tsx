"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Database, Settings, Activity, Terminal as TerminalIcon, Save, RefreshCw } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAppLogsSession } from "@/hooks/useAppLogsSession";
import { useSettingsStore } from "@/store/settings";
import "xterm/css/xterm.css";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DatabaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const { settings } = useSettingsStore();
  const dbPortalUrl = settings?.dbPortalUrl;

  const [activeTab, setActiveTab] = useState("overview");

  // Fetch Database Info
  const { data: db, isLoading } = useQuery({
    queryKey: ["database", id],
    queryFn: async () => {
      const res = await api.get(`/databases/${id}`);
      return res.data;
    },
  });

  // Settings State
  const [configForm, setConfigForm] = useState({
    cpuLimit: 0.5,
    memoryLimit: 512,
    maxConnections: 100,
  });

  useEffect(() => {
    if (db) {
      setConfigForm({
        cpuLimit: db.cpuLimit || 0.5,
        memoryLimit: db.memoryLimit || 512,
        maxConnections: db.maxConnections || 100,
      });
    }
  }, [db]);

  // Update Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      await api.put(`/databases/${id}/config`, data);
    },
    onSuccess: () => {
      toast.success("Configuration updated. Container recreated successfully.");
      queryClient.invalidateQueries({ queryKey: ["database", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update configuration");
    },
  });

  // Fetch Stats
  const { data: stats } = useQuery({
    queryKey: ["database-stats", id],
    queryFn: async () => {
      const res = await api.get(`/databases/${id}/stats`);
      return res.data;
    },
    refetchInterval: 5000,
    enabled: activeTab === "overview" && db?.status === "RUNNING",
  });

  // Logs Hook
  const {
    appLogsTerminalRef,
    isAppLogsConnected,
    handleConnectAppLogs,
    handleDisconnectAppLogs,
    handleClearAppLogs,
    handleDownloadAppLogs,
    fitAppLogsTerminal,
  } = useAppLogsSession(id, true); // true for isDatabase

  useEffect(() => {
    if (activeTab === "logs") {
      fitAppLogsTerminal();
    }
  }, [activeTab]);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center text-muted-foreground">Loading database details...</div>;
  }

  if (!db) {
    return <div className="p-8 flex items-center justify-center text-red-500">Database not found.</div>;
  }

  // Parse Stats
  const cpuUsage = stats?.cpu ? parseFloat(stats.cpu.replace('%', '')) : 0;
  const memUsageStr = stats?.ram ? stats.ram.split(' / ')[0] : '0MiB';
  let memUsageVal = parseFloat(memUsageStr);
  if (memUsageStr.includes('GiB')) memUsageVal *= 1024;
  
  const memoryPercentage = db.memoryLimit ? (memUsageVal / db.memoryLimit) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Header */}
        <div>
          <Link href="/databases" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Databases
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                db.type === 'POSTGRESQL' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                <Database className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">{db.name}</h1>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 capitalize ${
                    db.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    db.status === 'STOPPED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      db.status === 'RUNNING' ? 'bg-emerald-500' :
                      db.status === 'STOPPED' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`} />
                    {(db.status || 'UNKNOWN').toLowerCase()}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {db.type === 'POSTGRESQL' ? 'PostgreSQL' : 'MySQL'} {db.version}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {dbPortalUrl && (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="h-8 text-xs bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 hover:text-indigo-600 border-0"
                  onClick={() => {
                    const isPg = db.type === 'POSTGRESQL';
                    const portal = new URL(dbPortalUrl);
                    portal.searchParams.set(isPg ? 'pgsql' : 'mysql', '');
                    portal.searchParams.set('server', `host.docker.internal:${db.hostPort}`);
                    portal.searchParams.set('username', db.dbUser || '');
                    window.open(portal.toString(), '_blank');
                  }}
                >
                  <Database className="w-3.5 h-3.5 mr-1.5" />
                  Manage Database
                </Button>
              )}
              <Button 
                variant={activeTab === "overview" ? "default" : "outline"}
                className={activeTab === "overview" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : ""}
                onClick={() => setActiveTab("overview")}
              >
                <Activity className="w-4 h-4 mr-2" /> Overview
              </Button>
              <Button 
                variant={activeTab === "logs" ? "default" : "outline"}
                className={activeTab === "logs" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : ""}
                onClick={() => setActiveTab("logs")}
              >
                <TerminalIcon className="w-4 h-4 mr-2" /> Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* CPU Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">CPU Usage</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {cpuUsage.toFixed(2)}%
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ {db.cpuLimit ? db.cpuLimit * 100 : 50}% limit</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((cpuUsage / (db.cpuLimit ? db.cpuLimit * 100 : 50)) * 100, 100)}%` }} 
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                Real-time usage
              </p>
            </div>

            {/* RAM Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Memory Usage</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {memUsageVal.toFixed(1)} MB
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ {db.memoryLimit || 512} MB limit</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${memoryPercentage > 85 ? 'bg-red-500' : memoryPercentage > 70 ? 'bg-amber-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min(memoryPercentage, 100)}%` }} 
                />
              </div>
              <p className="text-xs text-muted-foreground text-right">
                {memoryPercentage.toFixed(1)}% of limit
              </p>
            </div>
          </div>
        )}

        {/* Logs Tab - always mounted so xterm ref is available */}
        <div className={`bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px] ${activeTab === "logs" ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : "hidden"}`}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Container Logs</h3>
              </div>
              <div className="flex items-center gap-2">
                {!isAppLogsConnected ? (
                  <Button size="sm" onClick={handleConnectAppLogs} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" variant="destructive" onClick={handleDisconnectAppLogs} className="h-8 text-xs">
                    Disconnect
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleClearAppLogs} className="h-8 text-xs">
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-[#111827] p-4 overflow-hidden relative">
              <div ref={appLogsTerminalRef} className="w-full h-full" />
              {!isAppLogsConnected && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <Button onClick={handleConnectAppLogs} className="bg-blue-600 hover:bg-blue-700">
                    Start Streaming Logs
                  </Button>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
