"use client";

import { useState, useRef } from "react";
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
  CheckCircle2,
  CloudUpload,
  Info,
  Rocket,
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

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const deploymentType = watch("deploymentType");

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (data.deploymentType === "ZIP" && !file) {
        throw new Error("File ZIP belum dipilih!");
      }

      // Clean up empty string payloads so backend optional validation works
      const payload = { ...data };
      if (!payload.repositoryUrl) delete payload.repositoryUrl;
      if (!payload.domain) delete payload.domain;
      if (!payload.description) delete payload.description;

      // 1. Create Project
      const res = await api.post("/projects", payload);
      const project = res.data;

      // 2. Upload ZIP
      if (data.deploymentType === "ZIP" && file) {
        const formData = new FormData();
        formData.append("file", file);
        await api.post(`/deployments/${project.id}/zip`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (data.deploymentType === "GITHUB" && data.repositoryUrl) {
        await api.post(`/deployments/${project.id}/github`, {
          repositoryUrl: data.repositoryUrl,
          branch: "main",
        });
      }

      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Deployment sedang berjalan!");
      router.push(`/projects/${data.id}`);
    },
    onError: (error: any) => {
      // Prioritize backend error message over generic axios error message
      const errMessage = error.response?.data?.message || error.message || "Gagal melakukan deployment";
      toast.error(errMessage);
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
              <div className="space-y-2 pt-2 border-t border-slate-100 mt-4">
                <Label htmlFor="repositoryUrl">Repository URL</Label>
                <Input
                  id="repositoryUrl"
                  placeholder="https://github.com/username/repo"
                  {...register("repositoryUrl")}
                  className="h-10"
                />
              </div>
            )}

            {deploymentType === "ZIP" && (
              <div className="space-y-3 pt-2 border-t border-slate-100 mt-4">
                <div>
                  <Label>Upload ZIP File</Label>
                  <p className="text-xs text-slate-500 mb-2">Upload source code aplikasi Anda dalam format ZIP. Max 50MB.</p>
                </div>
                
                <div
                  onDragOver={handleFileDrop}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150",
                    dragOver ? "border-blue-400 bg-blue-50" :
                    file ? "border-green-400 bg-green-50" :
                    "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  )}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file ? (
                    <>
                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-medium text-green-700">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-slate-400 mt-2">Klik untuk mengubah file</p>
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-medium text-slate-700 mb-1">
                        Drag & drop file ZIP di sini
                      </p>
                      <p className="text-xs text-slate-500">
                        atau klik untuk memilih file
                      </p>
                    </>
                  )}
                </div>
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
                Mengunggah & Deploying...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Project
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
