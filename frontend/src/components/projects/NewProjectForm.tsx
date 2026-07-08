import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Rocket } from "lucide-react";
import Link from "next/link";
import { Controller } from "react-hook-form";
import { DeploymentMethodSelector } from "@/components/projects/forms/DeploymentMethodSelector";
import { GithubRepoField } from "@/components/projects/forms/GithubRepoField";
import { ZipUploadField } from "@/components/projects/forms/ZipUploadField";
import { DockerfileField } from "@/components/projects/forms/DockerfileField";

interface NewProjectFormProps {
  register: any;
  handleSubmit: any;
  watch: any;
  setValue: any;
  control: any;
  errors: any;
  deploymentType: string;
  file: File | null;
  setFile: (file: File | null) => void;
  dragOver: boolean;
  setDragOver: (val: boolean) => void;
  handleFileDrop: (e: React.DragEvent) => void;
  uploadProgress: number;
  isPending: boolean;
  onSubmit: (data: any) => void;
}

export function NewProjectForm({
  register,
  handleSubmit,
  watch,
  setValue,
  control,
  errors,
  deploymentType,
  file,
  setFile,
  dragOver,
  setDragOver,
  handleFileDrop,
  uploadProgress,
  isPending,
  onSubmit
}: NewProjectFormProps) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card className="bg-card border border-border shadow-sm">
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

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="internalPort">Custom Internal Port (opsional)</Label>
          </div>
          <Input
            id="internalPort"
            type="number"
            placeholder="Biarkan kosong untuk deteksi otomatis (misal: 3000)"
            {...register("internalPort")}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Hanya isi jika Anda ingin menimpa port internal yang terdeteksi otomatis.
          </p>
        </div>
      </CardContent>
    </Card>

    {/* Deployment Type */}
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Metode Deployment</CardTitle>
        <CardDescription>Pilih cara Anda mendeploy aplikasi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <DeploymentMethodSelector 
          deploymentType={deploymentType} 
          setValue={setValue} 
        />

        {deploymentType === "GITHUB" && (
          <GithubRepoField register={register} isPending={isPending} />
        )}

        {deploymentType === "ZIP" && (
          <ZipUploadField
            file={file}
            setFile={setFile}
            dragOver={dragOver}
            setDragOver={setDragOver}
            handleFileDrop={handleFileDrop}
            uploadProgress={uploadProgress}
            isPending={isPending}
          />
        )}

        {deploymentType === "DOCKERFILE" && (
          <DockerfileField
            file={file}
            setFile={setFile}
            dragOver={dragOver}
            setDragOver={setDragOver}
            handleFileDrop={handleFileDrop}
            uploadProgress={uploadProgress}
            isPending={isPending}
          />
        )}

        {(deploymentType === "GITHUB" || deploymentType === "ZIP") && (
          <div className="space-y-2 pt-4 border-t border-border mt-4">
            <Label htmlFor="templateId">Web Server (App Template)</Label>
            <Controller
              name="templateId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="Select App Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NIXPACKS">Auto-Detect (Nixpacks)</SelectItem>
                    <SelectItem value="STATIC_NGINX">Static HTML (Nginx)</SelectItem>
                    <SelectItem value="STATIC_APACHE">Static HTML (Apache)</SelectItem>
                    <SelectItem value="PHP_APACHE">PHP (Apache)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">Pilih web server internal untuk menjalankan kode Anda.</p>
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
        disabled={isPending}
        className="flex-1 h-11 portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
      >
        {isPending ? (
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
  );
}
