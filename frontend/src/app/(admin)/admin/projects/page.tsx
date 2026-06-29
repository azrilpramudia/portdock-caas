"use client";

import { useQuery } from "@tanstack/react-query";
import { Server, Loader2, Globe, Box } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminProjectsPage() {
  const token = useAuthStore(state => state.token);
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["admin-projects"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:3000/admin/projects", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    enabled: !!token
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Server className="w-6 h-6 text-red-500" /> Global Projects
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Overview of all projects deployed on this server.
        </p>
      </div>

      <Card className="bg-card border-border shadow-sm">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle className="text-lg">All Projects</CardTitle>
          <CardDescription>Total {projects?.length || 0} projects running.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Project Name</th>
                  <th className="px-6 py-4 font-medium">Owner (Email)</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Containers</th>
                  <th className="px-6 py-4 font-medium">Domain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects?.map((project: any) => (
                  <tr key={project.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">
                      {project.name}
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{project.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {project.user?.name}
                      <div className="text-xs text-muted-foreground">{project.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={project.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-[10px]">
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Box className="w-4 h-4" />
                        <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-xs">
                          {project._count?.containers || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.domain ? (
                        <a href={`https://${project.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-500 hover:underline text-xs">
                          <Globe className="w-3.5 h-3.5" />
                          {project.domain}
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">No domain</span>
                      )}
                    </td>
                  </tr>
                ))}
                {projects?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No projects found on the server.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
