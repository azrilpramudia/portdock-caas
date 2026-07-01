"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export function RecentDeployments() {
  const deployments = [
    { id: "#DEP-1245", project: "E-Commerce API", user: "azril@example.com", status: "Success", time: "2 menit lalu", duration: "01:24" },
    { id: "#DEP-1244", project: "Portfolio Web", user: "budi@example.com", status: "Success", time: "15 menit lalu", duration: "02:31" },
    { id: "#DEP-1243", project: "Blog System", user: "andi@example.com", status: "Failed", time: "1 jam lalu", duration: "00:45" },
    { id: "#DEP-1242", project: "Company Profile", user: "siti@example.com", status: "Success", time: "2 jam lalu", duration: "01:12" },
    { id: "#DEP-1241", project: "Landing Page", user: "dimas@example.com", status: "Building", time: "2 jam lalu", duration: "-" },
  ];

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full transition-colors">
      <div className="pt-6 px-6 pb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-foreground">Deployment Terbaru</h3>
      </div>
      
      <div className="flex-1 overflow-x-auto px-6">
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-left">ID</th>
                <th className="px-4 py-3 font-semibold text-left">Project</th>
                <th className="px-4 py-3 font-semibold text-left">User</th>
                <th className="px-4 py-3 font-semibold text-left">Status</th>
                <th className="px-4 py-3 font-semibold text-left">Waktu</th>
                <th className="px-4 py-3 font-semibold text-left">Durasi</th>
              </tr>
            </thead>
          <tbody>
            {deployments.map((dep, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3.5 font-medium text-muted-foreground">{dep.id}</td>
                <td className="px-4 py-3.5 font-semibold text-foreground">{dep.project}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{dep.user}</td>
                <td className="px-4 py-3.5">
                  {dep.status === 'Success' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Success
                    </span>
                  )}
                  {dep.status === 'Failed' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Failed
                    </span>
                  )}
                  {dep.status === 'Building' && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5 mr-1.5" />
                      Building
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground">{dep.time}</td>
                <td className="px-4 py-3.5 text-muted-foreground font-medium">{dep.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <div className="mt-auto px-6 pt-2 pb-6">
        <Link href="/admin/deployments" className="inline-flex items-center text-[13px] font-bold text-primary hover:text-primary/80 transition-colors">
          Lihat semua deployment <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
