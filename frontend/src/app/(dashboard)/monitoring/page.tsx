"use client";

import { useQuery } from "@tanstack/react-query";
import { Container, BarChart3, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export default function MonitoringIndexPage() {
  const { data: containers, isLoading } = useQuery({
    queryKey: ["containers"],
    queryFn: async () => {
      const res = await api.get("/containers");
      return res.data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Monitoring</h1>
        <p className="text-slate-500 mt-1">Pilih container untuk melihat resource usage secara real-time</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : containers?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {containers.map((c: any) => (
            <Link key={c.id} href={`/monitoring/${c.id}`}>
              <Card className="bg-white border border-slate-200/60 shadow-sm portdock-card-hover cursor-pointer">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Container className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.imageName}:{c.imageTag}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border ${c.status === "RUNNING" ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {c.status}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500">Belum ada container untuk dimonitor</p>
        </div>
      )}
    </div>
  );
}
