"use client";

import { useState, useEffect } from "react";
import { useAdminDatabase } from "@/hooks/useAdminDatabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Database, 
  Settings, 
  Save, 
  RefreshCw,
  Loader2,
  Server,
  User,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export default function AdminDatabaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const queryClient = useQueryClient();

  const { data: db, isLoading } = useAdminDatabase(id);

  const [configForm, setConfigForm] = useState<{
    cpuLimit: number | string;
    memoryLimit: number | string;
    maxConnections: number | string;
  }>({
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

  const updateConfigMutation = useMutation({
    mutationFn: async (data: typeof configForm) => {
      const payload = {
        cpuLimit: Number(data.cpuLimit) || 0,
        memoryLimit: Number(data.memoryLimit) || 0,
        maxConnections: Number(data.maxConnections) || 0,
      };
      const response = await api.patch(`/admin/databases/${id}/config`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_database", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!db) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Database className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-bold">Database not found</h2>
        <Button className="mt-4" onClick={() => router.push('/admin/databases')}>Back to Databases</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/admin/databases" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Databases
        </Link>
        <div className="flex items-center justify-between bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              db.type === 'POSTGRESQL' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
            }`}>
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">{db.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide flex items-center gap-1.5 ${
                  db.status === 'RUNNING' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                  db.status === 'STOPPED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {db.status === 'RUNNING' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {db.status}
                </span>
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" />
                  {db.type === 'POSTGRESQL' ? 'PostgreSQL' : 'MySQL'} {db.version}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Owner</span>
            <div className="flex items-center gap-2 mt-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{db.user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-500" />
          Advanced Configuration
        </h2>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cpuLimit" className="font-semibold text-foreground">CPU Cores Limit</Label>
              <Input 
                id="cpuLimit" 
                type="number" 
                step="0.1"
                min="0.1"
                value={configForm.cpuLimit}
                onChange={(e) => setConfigForm({ ...configForm, cpuLimit: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                className="bg-muted/50 border-border focus-visible:ring-blue-500/20"
              />
              <p className="text-[11px] text-muted-foreground">Example: 0.5 for half a core, 1 for 1 core.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="memoryLimit" className="font-semibold text-foreground">Memory Limit (MB)</Label>
              <Input 
                id="memoryLimit" 
                type="number" 
                step="128"
                min="256"
                value={configForm.memoryLimit}
                onChange={(e) => setConfigForm({ ...configForm, memoryLimit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                className="bg-muted/50 border-border focus-visible:ring-blue-500/20"
              />
              <p className="text-[11px] text-muted-foreground">Minimum recommended is 256MB.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxConnections" className="font-semibold text-foreground">Max Connections</Label>
            <Input 
              id="maxConnections" 
              type="number" 
              step="10"
              min="10"
              value={configForm.maxConnections}
              onChange={(e) => setConfigForm({ ...configForm, maxConnections: e.target.value === '' ? '' : parseInt(e.target.value) })}
              className="bg-muted/50 border-border focus-visible:ring-blue-500/20"
            />
            <p className="text-[11px] text-muted-foreground">Maximum concurrent connections allowed to the database (max_connections flag).</p>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Updating config will recreate and restart the container.
            </p>
            <Button 
              onClick={() => updateConfigMutation.mutate(configForm)}
              disabled={updateConfigMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md font-semibold min-w-[140px]"
            >
              {updateConfigMutation.isPending ? "Saving..." : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save & Apply
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
