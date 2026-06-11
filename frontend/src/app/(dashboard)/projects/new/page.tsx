"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  FolderPlus,
  GitBranch,
  FileArchive,
  FileCode,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  description: z.string().max(500).optional(),
  deploymentType: z.enum(["ZIP", "GITHUB", "DOCKERFILE"]),
  repositoryUrl: z.string().optional(),
  domain: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const deployTypes = [
  {
    value: "ZIP" as const,
    label: "ZIP Upload",
    description: "Upload source code sebagai file ZIP",
    icon: FileArchive,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  {
    value: "GITHUB" as const,
    label: "GitHub Repository",
    description: "Deploy dari repositori GitHub",
    icon: GitBranch,
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
  },
  {
    value: "DOCKERFILE" as const,
    label: "Custom Dockerfile",
    description: "Deploy menggunakan Dockerfile custom",
    icon: FileCode,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
];

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { deploymentType: "ZIP" },
  });

  const deploymentType = watch("deploymentType");

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post("/projects", data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project berhasil dibuat!");
      router.push(`/projects/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal membuat project");
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Baru</h1>
          <p className="text-slate-500 text-sm">Buat project deployment baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
        {/* Basic Info */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Informasi Project</CardTitle>
            <CardDescription>Detail dasar project Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Project <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Contoh: My Web App"
                {...register("name")}
                className="h-10"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                placeholder="Deskripsi singkat tentang project ini..."
                {...register("description")}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domain (opsional)</Label>
              <Input
                id="domain"
                placeholder="contoh.portdock.io"
                {...register("domain")}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Deployment Type */}
        <Card className="bg-white border border-slate-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Metode Deployment</CardTitle>
            <CardDescription>Pilih cara Anda mendeploy aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deployTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue("deploymentType", type.value)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150",
                  deploymentType === type.value
                    ? `border-blue-500 bg-blue-50/50 shadow-sm`
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    deploymentType === type.value ? type.bg : "bg-slate-100"
                  )}
                >
                  <type.icon
                    className={cn(
                      "w-5 h-5",
                      deploymentType === type.value ? type.color : "text-slate-500"
                    )}
                  />
                </div>
                <div>
                  <p
                    className={cn(
                      "font-medium text-sm",
                      deploymentType === type.value ? "text-blue-700" : "text-slate-700"
                    )}
                  >
                    {type.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
                </div>
                {deploymentType === type.value && (
                  <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </button>
            ))}

            {deploymentType === "GITHUB" && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="repositoryUrl">Repository URL</Label>
                <Input
                  id="repositoryUrl"
                  placeholder="https://github.com/username/repo"
                  {...register("repositoryUrl")}
                  className="h-10"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Link href="/projects" className="flex-1">
            <Button type="button" variant="outline" className="w-full h-11">
              Batal
            </Button>
          </Link>
          <Button
            type="submit"
            id="btn-create-project"
            disabled={createMutation.isPending}
            className="flex-1 h-11 portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4 mr-2" />
                Buat Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
