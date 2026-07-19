"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Trash2, Server, Key, Copy, CheckCircle2, Search, RefreshCw, Filter, Eye, EyeOff, MoreVertical, Play, Square, RotateCw, Archive, Download, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DatabasesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [backupDb, setBackupDb] = useState<any | null>(null);
  const [restoreBackupId, setRestoreBackupId] = useState<string | null>(null);
  const [deleteBackupId, setDeleteBackupId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleUrls, setVisibleUrls] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { settings } = useSettingsStore();
  const dbPortalUrl = settings?.dbPortalUrl;

  const { data: backups = [], isLoading: isBackupsLoading } = useQuery({
    queryKey: ["backups", backupDb?.id],
    queryFn: async () => {
      if (!backupDb?.id) return [];
      const res = await api.get(`/databases/${backupDb.id}/backups`);
      return res.data;
    },
    enabled: !!backupDb?.id,
  });

  const createBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/databases/${id}/backups`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups", backupDb?.id] });
      toast.success("Backup created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create backup");
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async ({ dbId, backupId }: { dbId: string, backupId: string }) => {
      await api.delete(`/databases/${dbId}/backups/${backupId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups", backupDb?.id] });
      toast.success("Backup deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete backup");
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async ({ dbId, backupId }: { dbId: string, backupId: string }) => {
      await api.post(`/databases/${dbId}/backups/${backupId}/restore`);
    },
    onSuccess: () => {
      toast.success("Backup restored successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to restore backup");
    },
  });

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
                          <Link href={`/databases/${db.id}`}>
                            <p className="text-[14px] font-semibold text-foreground group-hover:text-blue-500 transition-colors cursor-pointer">
                              {db.name}
                            </p>
                          </Link>
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
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${
                        db.status === 'RUNNING' ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/20' :
                        db.status === 'STOPPED' ? 'text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-500/20' :
                        'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          db.status === 'RUNNING' ? 'bg-emerald-500' :
                          db.status === 'STOPPED' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`} />
                        {(db.status || 'UNKNOWN').toLowerCase()}
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
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                               className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-purple-50 text-purple-500 hover:text-purple-600 dark:hover:bg-purple-500/10"
                               onClick={() => setBackupDb(db)}
                             >
                               <Archive className="w-4 h-4" />
                            </TooltipTrigger>
                            <TooltipContent>Manage Backups</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {dbPortalUrl && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-indigo-50 text-indigo-500 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                                  onClick={() => {
                                    const isPg = db.type === 'POSTGRESQL';
                                    const portal = new URL(dbPortalUrl);
                                    portal.searchParams.set(isPg ? 'pgsql' : 'mysql', '');
                                    portal.searchParams.set('server', `host.docker.internal:${db.hostPort}`);
                                    portal.searchParams.set('username', db.dbUser || '');
                                    window.open(portal.toString(), '_blank');
                                  }}
                                >
                                  <Database className="w-4 h-4" />
                              </TooltipTrigger>
                              <TooltipContent>Manage Database</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

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
                      </div>
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

      <Dialog open={!!backupDb} onOpenChange={(open) => !open && setBackupDb(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-purple-500" /> Manage Backups for {backupDb?.name}
            </DialogTitle>
            <DialogDescription>
              Create, restore, or download backups for this database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-4">
            <div className="flex justify-end">
              <Button 
                onClick={() => backupDb && createBackupMutation.mutate(backupDb.id)}
                disabled={createBackupMutation.isPending || backupDb?.status !== 'RUNNING'}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> 
                {createBackupMutation.isPending ? "Creating..." : "Create Backup"}
              </Button>
            </div>
            
            {backupDb?.status !== 'RUNNING' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-lg text-xs font-medium">
                Database must be running to create or restore backups.
              </div>
            )}

            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">File</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Size</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isBackupsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">Loading backups...</td>
                    </tr>
                  ) : backups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-xs">No backups found.</td>
                    </tr>
                  ) : (
                    backups.map((backup: any) => (
                      <tr key={backup.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-xs">
                          {new Date(backup.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono truncate max-w-[150px]" title={backup.filename}>
                          {backup.filename}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {backup.sizeBytes ? `${(backup.sizeBytes / 1024 / 1024).toFixed(2)} MB` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            backup.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            backup.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                          }`}>
                            {backup.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <a 
                              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/databases/${backupDb.id}/backups/${backup.id}/download`}
                              target="_blank"
                              download
                              className={backup.status !== 'SUCCESS' ? 'pointer-events-none opacity-50' : ''}
                            >
                              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={backup.status !== 'SUCCESS'}>
                                <Download className="w-3.5 h-3.5 text-blue-500" />
                              </Button>
                            </a>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              disabled={backup.status !== 'SUCCESS' || restoreBackupMutation.isPending || backupDb.status !== 'RUNNING'}
                              onClick={() => setRestoreBackupId(backup.id)}
                            >
                              <Undo2 className="w-3.5 h-3.5 text-amber-500" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              disabled={deleteBackupMutation.isPending}
                              onClick={() => setDeleteBackupId(backup.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!restoreBackupId} onOpenChange={() => setRestoreBackupId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-amber-600 flex items-center gap-2">
              <Undo2 className="w-5 h-5" /> Restore Backup
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to restore this backup? This will <strong>overwrite</strong> your current database data and cannot be undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setRestoreBackupId(null)} disabled={restoreBackupMutation.isPending}>
              Cancel
            </Button>
            <Button 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={() => {
                if (backupDb && restoreBackupId) {
                  restoreBackupMutation.mutate({ dbId: backupDb.id, backupId: restoreBackupId });
                  setRestoreBackupId(null);
                }
              }}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? "Restoring..." : "Restore Database"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteBackupId} onOpenChange={() => setDeleteBackupId(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Backup File
            </DialogTitle>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to delete this backup file? This action <strong>cannot</strong> be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteBackupId(null)} disabled={deleteBackupMutation.isPending}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (backupDb && deleteBackupId) {
                  deleteBackupMutation.mutate({ dbId: backupDb.id, backupId: deleteBackupId });
                  setDeleteBackupId(null);
                }
              }}
              disabled={deleteBackupMutation.isPending}
            >
              {deleteBackupMutation.isPending ? "Deleting..." : "Delete Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
