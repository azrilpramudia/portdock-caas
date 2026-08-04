"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Database, Activity, Terminal as TerminalIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings";
import { useDatabaseDetail } from "@/hooks/useDatabases";
import { DatabaseOverview } from "@/components/databases/DatabaseOverview";
import { DatabaseLogs } from "@/components/databases/DatabaseLogs";

export default function DatabaseDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { settings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState("overview");
  const dbPortalUrl = settings?.dbPortalUrl;

  const { db, isLoading, stats, resetPasswordMutation } = useDatabaseDetail(id);

  if (isLoading) {
    return <div className="p-8 flex items-center justify-center text-muted-foreground">Loading database details...</div>;
  }

  if (!db) {
    return <div className="p-8 flex items-center justify-center text-red-500">Database not found.</div>;
  }

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
                    const validUrl = dbPortalUrl.startsWith('http') ? dbPortalUrl : `https://${dbPortalUrl}`;
                    const portal = new URL(validUrl);
                    const targetServer = `127.0.0.1:${db.hostPort}`;
                    if (isPg) {
                      portal.searchParams.set('pgsql', targetServer);
                    } else {
                      portal.searchParams.set('server', targetServer);
                    }
                    portal.searchParams.set('username', db.dbUser || '');
                    portal.searchParams.set('db', db.dbName || '');
                    window.open(portal.toString(), '_blank');
                  }}
                >
                  <Database className="w-3.5 h-3.5 mr-1.5" />
                  Manage Database
                </Button>
              )}
              <Button 
                variant={activeTab === "overview" ? "default" : "outline"}
                className={`${activeTab === "overview" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : ""} transition-none active:scale-100`}
                onClick={() => setActiveTab("overview")}
              >
                <Activity className="w-4 h-4 mr-2" /> Overview
              </Button>
              <Button 
                variant={activeTab === "logs" ? "default" : "outline"}
                className={`${activeTab === "logs" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" : ""} transition-none active:scale-100`}
                onClick={() => setActiveTab("logs")}
              >
                <TerminalIcon className="w-4 h-4 mr-2" /> Logs
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <DatabaseOverview 
            db={db}
            stats={stats}
            resetPasswordMutation={resetPasswordMutation}
          />
        )}

        {/* Logs Tab - always mounted so xterm ref is available */}
        <DatabaseLogs id={id} active={activeTab === "logs"} />
      </div>
    </div>
  );
}
