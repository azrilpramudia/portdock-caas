"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, Settings2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SettingsGeneral } from "@/components/projects/settings/SettingsGeneral";
import { SettingsGit } from "@/components/projects/settings/SettingsGit";
import { SettingsEnvVars } from "@/components/projects/settings/SettingsEnvVars";
import { SettingsDangerZone } from "@/components/projects/settings/SettingsDangerZone";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [envs, setEnvs] = useState<{key: string, value: string, show?: boolean}[]>([]);
  
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [buildCommand, setBuildCommand] = useState("");
  const [startCommand, setStartCommand] = useState("");
  
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { project: projectData, isLoading, updateMutation, deleteMutation } = useProjectDetail(projectId);

  useEffect(() => {
    if (projectData) {
      setName(projectData.name || "");
      setDescription(projectData.description || "");
      setDomain(projectData.domain || "");
      setRepositoryUrl(projectData.repositoryUrl || "");
      setBranch(projectData.branch || "");
      setBuildCommand(projectData.buildCommand || "");
      setStartCommand(projectData.startCommand || "");
      
      const envObj = projectData.envVars;
      if (envObj && typeof envObj === 'object') {
        const envArray = Object.entries(envObj).map(([key, value]) => ({ key, value: String(value) }));
        setEnvs(envArray);
      }
    }
  }, [projectData]);

  const handleDelete = async () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Project deleted successfully");
        router.push("/projects");
      }
    });
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    const envObj: Record<string, string> = {};
    envs.forEach(e => {
      if (e.key.trim()) {
        envObj[e.key.trim()] = e.value;
      }
    });

    const payload = {
      name,
      description,
      domain: domain.trim() || undefined,
      repositoryUrl: repositoryUrl.trim() || undefined,
      branch: branch.trim() || undefined,
      buildCommand: buildCommand.trim() || undefined,
      startCommand: startCommand.trim() || undefined,
      envVars: envObj
    };

    updateMutation.mutate(payload as any, {
      onSuccess: () => {
        setIsDirty(false);
        toast.success("Project updated successfully");
      }
    });
  };

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      router.push("/projects");
    }
  };

  const confirmDiscard = () => {
    setShowDiscardModal(false);
    setIsDirty(false);
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <a href="#" onClick={handleNavigation} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-blue-600 transition-colors mb-2">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Projects
          </a>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-foreground" />
            Project Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage configuration, environments, and lifecycle for project <span className="font-semibold text-foreground">prj-{projectId}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 px-5 text-[13px] font-semibold border-border" onClick={handleNavigation}>
            Discard Changes
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={updateMutation.isPending}
            className="h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <SettingsGeneral 
            name={name} setName={setName}
            description={description} setDescription={setDescription}
            domain={domain} setDomain={setDomain}
            setIsDirty={setIsDirty}
          />
          <SettingsGit 
            repositoryUrl={repositoryUrl} setRepositoryUrl={setRepositoryUrl}
            branch={branch} setBranch={setBranch}
            buildCommand={buildCommand} setBuildCommand={setBuildCommand}
            startCommand={startCommand} setStartCommand={setStartCommand}
            setIsDirty={setIsDirty}
          />
          <SettingsEnvVars 
            envs={envs} setEnvs={setEnvs} setIsDirty={setIsDirty}
          />
        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          <SettingsDangerZone 
            handleDelete={() => setShowDeleteModal(true)} 
            isPending={deleteMutation.isPending} 
          />
        </div>
      </div>

      {/* Discard Modal */}
      <Dialog open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-lg">
          <DialogHeader>
            <DialogTitle>Discard Unsaved Changes</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDiscardModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDiscard}>Discard Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md bg-card border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete Project</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete this project? This action cannot be undone and will permanently delete all associated data, including containers and logs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
