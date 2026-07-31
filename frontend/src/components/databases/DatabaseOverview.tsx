"use client";

import { useState } from "react";
import { Activity, Database, AlertTriangle, KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ManagedDatabase, ContainerStats } from "@/types";
import { UseMutationResult } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface DatabaseOverviewProps {
  db: ManagedDatabase;
  stats?: ContainerStats;
  resetPasswordMutation: UseMutationResult<{ dbPassword: string }, AxiosError<{ message: string }>, void, unknown>;
}

export function DatabaseOverview({ db, stats, resetPasswordMutation }: DatabaseOverviewProps) {
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Parse Stats
  const cpuUsage = stats?.cpu ? parseFloat(stats.cpu.replace('%', '')) : 0;
  const memUsageStr = stats?.ram ? stats.ram.split(' / ')[0] : '0MiB';
  let memUsageVal = parseFloat(memUsageStr);
  if (memUsageStr.includes('GiB')) memUsageVal *= 1024;
  
  const memoryPercentage = db.memoryLimit ? (memUsageVal / db.memoryLimit) * 100 : 0;

  const handleResetPassword = () => {
    resetPasswordMutation.mutate(undefined, {
      onSuccess: (data) => {
        setNewPassword(data.dbPassword);
        toast.success("Password reset successfully!");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to reset password");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      
      {/* Security Card */}
      <div className="bg-card border border-destructive/20 rounded-2xl p-6 shadow-sm flex flex-col md:col-span-2">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-semibold text-destructive uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Danger Zone: Security
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Reset your database password. This will instantly disconnect any running apps using the old password.
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-destructive" />
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
          <div className="flex-1">
            <h4 className="font-medium text-foreground text-sm">Database Password</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Generate a new random 16-character password for this database.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger 
              render={
                <Button variant="destructive" size="sm" className="ml-4 h-9 shadow-sm" disabled={db.status !== 'RUNNING' || resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                </Button>
              } 
            />
            <AlertDialogContent className="border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will generate a new random password and immediately update the database container. 
                  <strong> Any applications currently connected using the old password will instantly crash or lose connection.</strong>
                  <br/><br/>
                  You will need to update the Environment Variables in your deployed projects to match the new password.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetPassword} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, reset password
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {newPassword && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between animate-in fade-in zoom-in duration-300">
            <div>
              <h4 className="font-semibold text-emerald-600 text-sm">New Password Generated!</h4>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-background px-2 py-1 rounded border border-border font-mono font-bold">
                  {showPassword ? newPassword : '••••••••••••••••'}
                </code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => {
                  navigator.clipboard.writeText(newPassword);
                  toast.success("Password copied to clipboard");
                }}>
                  <Save className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setNewPassword(null)} className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-500/20">
              Dismiss
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
