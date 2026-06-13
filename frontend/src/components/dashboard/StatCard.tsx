"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import React from "react";

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  iconColor: string;
  iconBgColor: string;
  trend?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  trend,
}: StatCardProps) {
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner`}>
            <Icon className={`w-7 h-7 ${iconColor}`} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
                  <ArrowRight className="w-2.5 h-2.5 -rotate-45 mr-0.5" />
                  {trend}
                </span>
                <span className="text-[11px] text-slate-400">from last week</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
