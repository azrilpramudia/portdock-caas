"use client";

import { useState } from "react";
import Link from "next/link";
import { Database, Server, Key, Copy, CheckCircle2, Search, RefreshCw, Filter, Eye, EyeOff, MoreVertical, Play, Square, RotateCw, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

import { ManagedDatabase } from "@/types";

interface DatabaseTableProps {
  databases: ManagedDatabase[];
  isLoading: boolean;
  refetch: () => void;
  startMutation: any;
  stopMutation: any;
  restartMutation: any;
  setDeleteId: (id: string | null) => void;
  setBackupDb: (db: ManagedDatabase | null) => void;
  dbPortalUrl?: string;
}

export function DatabaseTable({
  databases,
  isLoading,
  refetch,
  startMutation,
  stopMutation,
  restartMutation,
  setDeleteId,
  setBackupDb,
  dbPortalUrl
}: DatabaseTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleUrls, setVisibleUrls] = useState<Record<string, boolean>>({});

  const filteredDatabases = databases.filter((db: ManagedDatabase) => {
    const matchesSearch = db.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || db.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getConnectionString = (db: ManagedDatabase) => {
    const containerName = `portdock-db-${db.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    if (db.type === "POSTGRESQL") {
      return `postgres://${db.dbUser}:${db.dbPassword}@${containerName}:5432/${db.dbName}`;
    } else if (db.type === "MYSQL") {
      return `mysql://${db.dbUser}:${db.dbPassword}@${containerName}:3306/${db.dbName}`;
    }
    return "Unsupported DB Type";
  };

  const copyToClipboard = (db: ManagedDatabase, str: string) => {
    navigator.clipboard.writeText(str);
    setCopiedId(db.id);
    toast.success("Connection string copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
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
              filteredDatabases.map((db: ManagedDatabase) => (
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
                                  const validUrl = dbPortalUrl.startsWith('http') ? dbPortalUrl : `https://${dbPortalUrl}`;
                                  const portal = new URL(validUrl);
                                  const hostIp = '172.17.0.1'; // IP Bridge Docker (Host)
                                  if (isPg) {
                                    portal.searchParams.set('pgsql', `${hostIp}:${db.hostPort}`);
                                  } else {
                                    portal.searchParams.set('server', `${hostIp}:${db.hostPort}`);
                                  }
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
  );
}
