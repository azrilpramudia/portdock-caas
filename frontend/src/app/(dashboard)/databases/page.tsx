"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Database, Trash2, Server, Key, Copy, CheckCircle2, Search } from "lucide-react";
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
import api from "@/lib/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function DatabasesPage() {
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  const filteredDatabases = databases.filter((db: any) =>
    db.name.toLowerCase().includes(search.toLowerCase())
  );

  const getConnectionString = (db: any) => {
    // Determine public IP. In a real app, you'd fetch this from backend or env
    const host = window.location.hostname;
    
    if (db.type === "POSTGRESQL") {
      return `postgres://${db.dbUser}:${db.dbPassword}@${host}:${db.hostPort}/${db.dbName}`;
    } else if (db.type === "REDIS") {
      return `redis://default:${db.dbPassword}@${host}:${db.hostPort}`;
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
      {/* Header */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" /> Managed Databases
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Provision and manage your production databases instantly.
          </p>
        </div>
        <Link href="/databases/new">
          <Button className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
            <Plus className="w-4 h-4" /> New Database
          </Button>
        </Link>
      </div>

      {/* Main Table Section */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search databases..."
                className="pl-9 bg-background/50 border-border focus-visible:ring-primary/20 h-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[25%]">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%]">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[10%]">Port</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[35%]">Connection URL</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[15%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5"><div className="h-5 bg-muted rounded w-3/4"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-full"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-muted rounded w-full"></div></td>
                    <td className="px-6 py-5"><div className="h-8 bg-muted rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredDatabases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
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
                          db.type === 'POSTGRESQL' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase ${
                        db.type === 'POSTGRESQL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                      }`}>
                        {db.type} {db.version}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                        <Server className="w-3.5 h-3.5" />
                        {db.hostPort}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Input 
                          readOnly 
                          value={getConnectionString(db)} 
                          type="password"
                          className="h-8 text-xs bg-muted/50 border-transparent focus-visible:ring-0 font-mono"
                        />
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(db.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
