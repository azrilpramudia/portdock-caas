"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDeployments } from "@/hooks/useDeployments";
import { DeploymentLogsTerminal } from "@/components/projects/DeploymentLogsTerminal";
import {
  ArrowLeft,
  Upload,
  GitBranch,
  FileCode,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cloud,
  FileArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DockerfileField } from "@/components/projects/forms/DockerfileField";

export default function DeployPage() {
  const params = useParams();
  const projectId = params.id as string;
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [dragOver, setDragOver] = useState(false);

  const {
    deployStatus,
    progress,
    deployMessage,
    zipMutation,
    githubMutation,
    dockerfileMutation,
  } = useDeployments(projectId);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
  });

  useEffect(() => {
    if (project?.repositoryUrl && !githubUrl) {
      setGithubUrl(project.repositoryUrl);
    }
  }, [project?.repositoryUrl, githubUrl]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith(".zip")) {
      setFile(dropped);
    } else {
      toast.error("Hanya file ZIP yang diizinkan");
    }
  };

  const handleDockerfileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.toLowerCase().includes("dockerfile")) {
      setFile(dropped);
    } else {
      toast.error("File yang diunggah harus bernama Dockerfile!");
    }
  };

  const defaultTab = project?.deploymentType?.toLowerCase() || "zip";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/projects/${projectId}`}>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Deploy Aplikasi</h1>
          <p className="text-muted-foreground text-sm">
            {project?.name} — Pilih metode deployment
          </p>
        </div>
      </div>

      {deployStatus !== "idle" ? (
        <DeploymentLogsTerminal
          isDeploying={deployStatus === "deploying"}
          isSuccess={deployStatus === "success"}
          isError={deployStatus === "error"}
          uploadProgress={progress}
          deploymentType={project?.deploymentType || "ZIP"}
          projectName={project?.name}
          projectId={projectId}
          errorMessage={deployMessage}
        />
      ) : (
        <Card className="bg-card border border-border shadow-sm">
          <Tabs defaultValue={defaultTab} onValueChange={() => setFile(null)}>
            <CardHeader className="pb-0">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="zip" className="text-xs sm:text-sm">
                  <FileArchive className="w-3.5 h-3.5 mr-1.5" />
                  ZIP Upload
                </TabsTrigger>
                <TabsTrigger value="github" className="text-xs sm:text-sm">
                  <GitBranch className="w-3.5 h-3.5 mr-1.5" />
                  GitHub
                </TabsTrigger>
                <TabsTrigger value="dockerfile" className="text-xs sm:text-sm">
                  <FileCode className="w-3.5 h-3.5 mr-1.5" />
                  Dockerfile
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* ZIP Upload */}
            <TabsContent value="zip">
              <CardContent className="p-6 space-y-5">
                <div>
                  <CardTitle className="text-base mb-1">Upload ZIP File</CardTitle>
                  <CardDescription>Upload source code aplikasi Anda dalam format ZIP. Max 50MB.</CardDescription>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150",
                    dragOver ? "border-blue-400 bg-blue-500/10" :
                    file ? "border-green-400 bg-green-500/10" :
                    "border-border hover:border-blue-500/50 hover:bg-muted"
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
                      <p className="font-medium text-green-600 dark:text-green-400">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">Klik untuk mengubah file</p>
                    </>
                  ) : (
                    <>
                      <FileArchive className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="font-medium text-muted-foreground">
                        Drag & drop file ZIP di sini
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">atau klik untuk memilih file</p>
                    </>
                  )}
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                    Portdock akan otomatis mendeteksi runtime dan membuat Dockerfile jika tidak ada.
                  </AlertDescription>
                </Alert>

                <Button
                  id="btn-deploy-zip"
                  onClick={() => {
                    if (file) zipMutation.mutate(file);
                  }}
                  disabled={!file || zipMutation.isPending}
                  className="w-full h-11 portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
                >
                  {zipMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mendeploy...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Deploy ZIP</>
                  )}
                </Button>
              </CardContent>
            </TabsContent>

            {/* GitHub */}
            <TabsContent value="github">
              <CardContent className="p-6 space-y-5">
                <div>
                  <CardTitle className="text-base mb-1">Deploy dari GitHub</CardTitle>
                  <CardDescription>Clone dan deploy repositori GitHub Anda secara otomatis.</CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-url">Repository URL <span className="text-red-500">*</span></Label>
                    <Input
                      id="github-url"
                      placeholder="https://github.com/username/repository"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Input
                      id="branch"
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/20">
                  <GitBranch className="w-4 h-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 dark:text-blue-400 text-xs">
                    Pastikan repositori bersifat public atau Anda telah mengkonfigurasi GitHub token.
                  </AlertDescription>
                </Alert>

                <Button
                  id="btn-deploy-github"
                  onClick={() => githubMutation.mutate({ repositoryUrl: githubUrl, branch })}
                  disabled={!githubUrl || githubMutation.isPending}
                  className="w-full h-11 portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
                >
                  {githubMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deploying...</>
                  ) : (
                    <><GitBranch className="w-4 h-4 mr-2" />Deploy dari GitHub</>
                  )}
                </Button>
              </CardContent>
            </TabsContent>

            {/* Dockerfile */}
            <TabsContent value="dockerfile">
              <CardContent className="p-6 space-y-4">
                <div>
                  <CardTitle className="text-base mb-1">Custom Dockerfile</CardTitle>
                  <CardDescription>Upload Dockerfile Anda langsung ke server.</CardDescription>
                </div>
                
                <DockerfileField
                  file={file}
                  setFile={setFile}
                  dragOver={dragOver}
                  setDragOver={setDragOver}
                  handleFileDrop={handleDockerfileDrop}
                  uploadProgress={progress}
                  isPending={dockerfileMutation.isPending}
                />

                <Button
                  id="btn-deploy-dockerfile"
                  onClick={() => {
                    if (file) dockerfileMutation.mutate(file);
                  }}
                  disabled={!file || dockerfileMutation.isPending}
                  className="w-full h-11 portdock-gradient text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
                >
                  {dockerfileMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deploying...</>
                  ) : (
                    <><Upload className="w-4 h-4 mr-2" />Deploy Dockerfile</>
                  )}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
