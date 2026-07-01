"use client";

import Link from "next/link";
import { ArrowRight, User, Rocket, Box, Trash2, Settings } from "lucide-react";

export function RecentActivity() {
  const activities = [
    {
      title: "Azril Pramudia login ke sistem",
      time: "2 menit lalu",
      category: "Login",
      icon: User,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500",
    },
    {
      title: "Azril Pramudia melakukan deployment project E-Commerce API",
      time: "3 menit lalu",
      category: "Deployment",
      icon: Rocket,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500",
    },
    {
      title: "Budi Santoso stop container portfolio-web",
      time: "15 menit lalu",
      category: "Container",
      icon: Box,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500",
    },
    {
      title: "Andi Wijaya menghapus project test-app",
      time: "1 jam lalu",
      category: "Project",
      icon: Trash2,
      iconColor: "text-red-500",
      iconBg: "bg-red-500",
    },
    {
      title: "Admin restart layanan nginx",
      time: "2 jam lalu",
      category: "System",
      icon: Settings,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-500",
    },
  ];

  const getBadgeColor = (category: string) => {
    switch (category) {
      case 'Login': return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-slate-800';
      case 'Deployment': return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10';
      case 'Container': return 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10';
      case 'Project': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10';
      case 'System': return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-slate-800';
      default: return 'text-gray-600 bg-gray-50 dark:text-gray-300 dark:bg-slate-800';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col h-full transition-colors">
      <h3 className="text-base font-bold text-foreground mb-6">Aktivitas Terbaru</h3>
      
      <div className="flex-1 space-y-6">
        {activities.map((act, i) => {
          const Icon = act.icon;
          return (
            <div key={i} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.iconBg} text-white shadow-sm ring-4 ring-card`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-semibold text-foreground/90 leading-tight">
                  {act.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{act.time}</p>
              </div>
              <div className="shrink-0 pt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getBadgeColor(act.category)}`}>
                  {act.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-border">
        <Link href="/admin/activity" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          Lihat semua log aktivitas <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
