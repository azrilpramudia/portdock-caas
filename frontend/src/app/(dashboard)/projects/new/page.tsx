"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/lib/api";
import { DeploymentLogsTerminal } from "@/components/projects/DeploymentLogsTerminal";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

const schema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  description: z.string().max(500).optional(),
  deploymentType: z.enum(["ZIP", "GITHUB", "DOCKERFILE"]),
  templateId: z.enum(["NIXPACKS", "STATIC_NGINX", "STATIC_APACHE", "PHP_APACHE"]),
  repositoryUrl: z.string().optional(),
  domain: z.string().optional(),
  internalPort: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { deploymentType: "ZIP", templateId: "NIXPACKS" },
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deployedProjectId, setDeployedProjectId] = useState<string | null>(null);
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
      if ((data.deploymentType === "ZIP" || data.deploymentType === "DOCKERFILE") && !file) {
        throw new Error("File belum dipilih!");
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
        if (!file.name.toLowerCase().endsWith('.zip')) {
          throw new Error("File yang diunggah harus berformat .zip!");
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB
          throw new Error("Ukuran file ZIP tidak boleh lebih dari 50MB!");
        }

        const formData = new FormData();
        formData.append("file", file);
        if (data.internalPort) formData.append("internalPort", data.internalPort.toString());
        await api.post(`/deployments/${project.id}/zip`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          },
        });
      } else if (data.deploymentType === "GITHUB" && data.repositoryUrl) {
        await api.post(`/deployments/${project.id}/github`, {
          repositoryUrl: data.repositoryUrl,
          branch: "main",
          internalPort: data.internalPort,
        });
      } else if (data.deploymentType === "DOCKERFILE" && file) {
        if (!file.name.toLowerCase().includes('dockerfile')) {
          throw new Error("File yang diunggah harus bernama Dockerfile!");
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
          throw new Error("Ukuran file Dockerfile tidak boleh lebih dari 5MB!");
        }

        const formData = new FormData();
        formData.append("file", file);
        if (data.internalPort) formData.append("internalPort", data.internalPort.toString());
        await api.post(`/deployments/${project.id}/dockerfile`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          },
        });
      }

      return project;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setDeployedProjectId(data.id);
      // We don't redirect immediately so they can see the success UI!
      // router.push(`/projects/${data.id}`);
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
          <h1 className="text-2xl font-bold text-foreground">Project Baru</h1>
          <p className="text-muted-foreground text-sm">Buat project deployment baru</p>
        </div>
      </div>

      {createMutation.isPending || createMutation.isSuccess || createMutation.isError ? (
        <DeploymentLogsTerminal
          isDeploying={createMutation.isPending}
          isSuccess={createMutation.isSuccess}
          isError={createMutation.isError}
          uploadProgress={uploadProgress}
          deploymentType={deploymentType}
          projectName={watch("name")}
          projectId={deployedProjectId || undefined}
          errorMessage={createMutation.error ? (createMutation.error as any).response?.data?.message || (createMutation.error as any).message : undefined}
        />
      ) : (
        <NewProjectForm
          register={register}
          handleSubmit={handleSubmit}
          watch={watch}
          setValue={setValue}
          control={control}
          errors={errors}
          deploymentType={deploymentType}
          file={file}
          setFile={setFile}
          dragOver={dragOver}
          setDragOver={setDragOver}
          handleFileDrop={handleFileDrop}
          uploadProgress={uploadProgress}
          isPending={createMutation.isPending}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}
