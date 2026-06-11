"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  FolderOpen,
  Container,
  MoreHorizontal,
  Trash2,
  Edit,
  Rocket,
  Filter,
  Loader2,
  BarChart3,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DeployBadge } from "@/components/shared/DeployBadge";
import { useProjectsList, useDeleteProject } from "@/hooks/useProjects";



export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useProjectsList(search, statusFilter);
  const deleteMutation = useDeleteProject(() => setDeleteId(null));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Kelola semua project deployment Anda</p>
        </div>
        <Link href="/projects/new">
          <Button id="btn-new-project" className="portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Project Baru
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            id="search-projects"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-white border-slate-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "")}>
          <SelectTrigger className="w-40 h-10 bg-white border-slate-200">
            <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="INACTIVE">Tidak Aktif</SelectItem>
            <SelectItem value="BUILDING">Building</SelectItem>
            <SelectItem value="FAILED">Gagal</SelectItem>
          </SelectContent>
        </Select>
        {data && (
          <p className="text-sm text-slate-500">
            {data.total} project ditemukan
          </p>
        )}
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : data?.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {data.data.map((project: any) => (
            <Card
              key={project.id}
              className="bg-white border border-slate-200/60 shadow-sm portdock-card-hover group"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <DeployBadge type={project.deploymentType} />
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <Link href={`/projects/${project.id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Detail
                        </DropdownMenuItem>
                      </Link>
                      <Link href={`/projects/${project.id}/deploy`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Deploy
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {project.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Container className="w-3.5 h-3.5" />
                    {project.containers?.length || 0} container
                  </div>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full h-8 text-xs border-slate-200">
                      Detail
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/deploy`} className="flex-1">
                    <Button size="sm" className="w-full h-8 text-xs portdock-gradient text-white hover:opacity-90">
                      <Rocket className="w-3 h-3 mr-1.5" /> Deploy
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpen className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum ada project</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-xs">
            Mulai dengan membuat project baru untuk mendeploy aplikasi Anda.
          </p>
          <Link href="/projects/new">
            <Button className="portdock-gradient text-white shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4 mr-2" /> Buat Project Pertama
            </Button>
          </Link>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Project?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Semua container yang terkait juga akan dihapus.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
