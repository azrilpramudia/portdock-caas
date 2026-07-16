"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Trash2, Server, Key, Copy, CheckCircle2, Search, RefreshCw, Filter, Eye, EyeOff, MoreVertical, Play, Square, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DatabasesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleUrls, setVisibleUrls] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  const { data: databases = [], isLoading, refetch } = useQuery({
    queryKey: ["databases"],
    queryFn: async () => {
      const res = await api.get("/databases");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/databases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      setDeleteId(null);
      toast.success("Database deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete database");
      setDeleteId(null);
    },
  });

  const startMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/start`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database started successfully");
    },
    onError: () => toast.error("Failed to start database"),
  });

  const stopMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/stop`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database stopped successfully");
    },
    onError: () => toast.error("Failed to stop database"),
  });

  const restartMutation = useMutation({
    mutationFn: async (id: string) => await api.post(`/databases/${id}/restart`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["databases"] });
      toast.success("Database restarted successfully");
    },
    onError: () => toast.error("Failed to restart database"),
  });

  const filteredDatabases = databases.filter((db: any) => {
    const matchesSearch = db.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || db.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getConnectionString = (db: any) => {
    // Determine public IP. In a real app, you'd fetch this from backend or env
    const host = window.location.hostname;
    
    if (db.type === "POSTGRESQL") {
      return `postgres://${db.dbUser}:${db.dbPassword}@${host}:${db.hostPort}/${db.dbName}`;
    } else if (db.type === "MYSQL") {
      return `mysql://${db.dbUser}:${db.dbPassword}@${host}:${db.hostPort}/${db.dbName}`;
    }
    return "Unsupported DB Type";
  };

  const copyToClipboard = (db: any, str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedId(db.id);
    toast.success("Connection string copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Main Table Section */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-[17px] font-bold text-foreground">All Databases</h2>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  refetch();
                  toast.success("Database list updated");
                }}
                disabled={isLoading}
                className="h-9 rounded-lg text-[13px] font-semibold border-border bg-card hover:bg-muted"
              >
                <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/databases/new">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px]">
                  <Plus className="w-4 h-4 mr-1.5" /> Create New Database
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search databases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-muted/50 border-border text-[13px] rounded-xl focus-visible:ring-blue-500/20 w-full"
              />
            </div>
            <div className="relative w-full sm:w-40 shrink-0">
              <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || "all")}>
                <SelectTrigger className="w-full bg-card border-border text-foreground text-[13px] rounded-xl h-10 px-4 font-bold focus:ring-blue-500/20">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="truncate">
                      {typeFilter === 'all' ? 'All Types' : 
                       typeFilter === 'POSTGRESQL' ? 'PostgreSQL' : 
                       typeFilter === 'MYSQL' ? 'MySQL' : 'All Types'}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
                  <SelectItem value="MYSQL">MySQL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[20%]">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[15%]">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[10%]">Port</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[10%]">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[30%]">Connection URL</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-5 bg-muted rounded w-3/4"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-full"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-full"></div></td>
                    <td className="px-6 py-5"><div className="h-8 bg-muted rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredDatabases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
                        <Database className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">No databases found</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                        You haven't provisioned any managed databases yet. Get started by creating your first one.
                      </p>
                      <Link href="/databases/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md">
                          Create Database
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDatabases.map((db: any) => (
                  <tr key={db.id} className="group hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          db.type === 'POSTGRESQL' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-foreground group-hover:text-blue-500 transition-colors">
                            {db.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] font-medium text-muted-foreground">
                              {formatDistanceToNow(new Date(db.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide whitespace-nowrap ${
                        db.type === 'POSTGRESQL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                      }`}>
                        {db.type === 'POSTGRESQL' ? 'PostgreSQL' : 'MySQL'} {db.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Server className="w-3.5 h-3.5" />
                        {db.hostPort}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${
                        db.status === 'RUNNING' ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10' :
                        db.status === 'STOPPED' ? 'text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-500/10' :
                        'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          db.status === 'RUNNING' ? 'bg-emerald-500' :
                          db.status === 'STOPPED' ? 'bg-gray-500' :
                          'bg-red-500'
                        }`} />
                        {db.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Input 
                          readOnly 
                          value={getConnectionString(db)} 
                          type={visibleUrls[db.id] ? "text" : "password"}
                          className={`h-8 text-xs bg-muted/50 border-transparent focus-visible:ring-0 font-mono transition-all ${visibleUrls[db.id] ? 'w-[280px]' : 'w-[200px]'}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 hover:bg-muted text-muted-foreground"
                          onClick={() => setVisibleUrls(prev => ({ ...prev, [db.id]: !prev[db.id] }))}
                        >
                          {visibleUrls[db.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 shrink-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10"
                          onClick={() => copyToClipboard(db, getConnectionString(db))}
                        >
                          {copiedId === db.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-border">
                          {db.status !== 'RUNNING' && (
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer font-medium" 
                              onClick={() => startMutation.mutate(db.id)}
                            >
                              <Play className="w-4 h-4 text-emerald-500" /> Start
                            </DropdownMenuItem>
                          )}
                          {db.status === 'RUNNING' && (
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer font-medium" 
                              onClick={() => stopMutation.mutate(db.id)}
                            >
                              <Square className="w-4 h-4 text-amber-500" /> Stop
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer font-medium" 
                            onClick={() => restartMutation.mutate(db.id)}
                          >
                            <RotateCw className="w-4 h-4 text-blue-500" /> Restart
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-border/50" />
                          <DropdownMenuItem 
                            className="gap-2 cursor-pointer text-red-600 font-medium focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                            onClick={() => setDeleteId(db.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Database
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to delete this database? This will permanently erase all data, volumes, and configurations. This action <strong>cannot</strong> be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
