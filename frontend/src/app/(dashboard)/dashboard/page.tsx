"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Plus, FolderOpen, Container, Play, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

// Extracted Components
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentProjectsList } from "@/components/dashboard/RecentProjectsList";
import { ResourceUsageChart } from "@/components/dashboard/ResourceUsageChart";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/monitoring/dashboard");
      return res.data;
    },
    refetchInterval: 30000,
  });

  const statCards = [
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      iconColor: "text-blue-600",
      iconBgColor: "bg-blue-50",
      trend: stats?.totalProjects ? "+2" : "",
    },
    {
      title: "Total Containers",
      value: stats?.totalContainers || 0,
      icon: Container,
      iconColor: "text-emerald-500",
      iconBgColor: "bg-emerald-50",
      trend: stats?.totalContainers ? "+1" : "",
    },
    {
      title: "Running Containers",
      value: stats?.runningContainers || 0,
      icon: Play,
      iconColor: "text-amber-500",
      iconBgColor: "bg-amber-50",
      trend: stats?.runningContainers ? "+2" : "",
    },
    {
      title: "Total Deployments",
      value: stats?.totalDeployments || 0,
      icon: Rocket,
      iconColor: "text-purple-600",
      iconBgColor: "bg-purple-50",
      trend: stats?.totalDeployments ? "+5" : "",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <RecentProjectsList projects={stats?.recentProjects} isLoading={isLoading} />

        {/* Resource Usage (Live Charts) */}
        <ResourceUsageChart data={stats?.chartData} />
      </div>

      {/* Recent Activity */}
      <RecentActivityFeed activities={stats?.recentActivity} />

      {/* Centered Button */}
      <div className="flex justify-center pt-4 pb-8">
        <Link href="/projects/new">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 h-11 rounded-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] text-[13px]">
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </Link>
      </div>

    </div>
  );
}
