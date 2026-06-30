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
      case 'Login': return 'text-gray-600 bg-gray-100 border-gray-200';
      case 'Deployment': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Container': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Project': return 'text-red-600 bg-red-50 border-red-100';
      case 'System': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-base font-bold text-gray-900 mb-6">Aktivitas Terbaru</h3>
      
      <div className="flex-1 space-y-6">
        {activities.map((act, i) => {
          const Icon = act.icon;
          return (
            <div key={i} className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${act.iconBg} text-white shadow-sm ring-4 ring-white`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {act.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">{act.time}</p>
              </div>
              <div className="shrink-0 pt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor(act.category)}`}>
                  {act.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <Link href="/admin/activity" className="inline-flex items-center text-sm font-semibold text-[#0066FF] hover:text-blue-700 transition-colors">
          Lihat semua aktivitas <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
