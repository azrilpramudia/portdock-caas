"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Plus, Trash2, ShieldAlert, Globe, Server, Settings2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");
  const [envs, setEnvs] = useState<{key: string, value: string}[]>([]);
  
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const { data: projectData, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectsService.getProjectById(projectId),
  });

  useEffect(() => {
    if (projectData) {
      setName(projectData.name || "");
      setDescription(projectData.description || "");
      setDomain(projectData.domain || "");
      
      const envObj = projectData.envVars;
      if (envObj && typeof envObj === 'object') {
        const envArray = Object.entries(envObj).map(([key, value]) => ({ key, value: String(value) }));
        setEnvs(envArray);
      }
    }
  }, [projectData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => projectsService.updateProject(projectId, data),
    onSuccess: () => {
      toast.success("Project settings updated successfully");
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update project settings");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => projectsService.deleteProject(projectId),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      router.push("/projects");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  });

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

    updateMutation.mutate({
      name,
      description,
      domain: domain.trim() || undefined,
      envVars: envObj
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const addEnv = () => { setEnvs([...envs, { key: "", value: "" }]); setIsDirty(true); };
  const removeEnv = (index: number) => { setEnvs(envs.filter((_, i) => i !== index)); setIsDirty(true); };

  const handleEnvChange = (index: number, field: 'key' | 'value', val: string) => {
    const newEnvs = [...envs];
    newEnvs[index][field] = val;
    setEnvs(newEnvs);
    setIsDirty(true);
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
          
          {/* General Settings */}
          <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
            <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-600" /> General Details
              </CardTitle>
              <CardDescription>Update the basic information of your project.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Project Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => { setName(e.target.value); setIsDirty(true); }}
                  className="h-11 border-border focus-visible:ring-blue-500 bg-card" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Description</Label>
                <textarea 
                  className="w-full min-h-[100px] p-3 text-sm rounded-lg border border-border bg-card placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  value={description}
                  onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
            <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-600" /> Environment Variables
                  </CardTitle>
                  <CardDescription className="mt-1">Securely inject runtime configurations.</CardDescription>
                </div>
                <Button onClick={addEnv} variant="outline" size="sm" className="h-8 text-xs font-semibold text-blue-600 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20">
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Var
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {envs.map((env, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-1.5">
                    <Input 
                      placeholder="KEY (e.g. DATABASE_URL)" 
                      value={env.key} 
                      onChange={(e) => handleEnvChange(idx, 'key', e.target.value)}
                      className="h-10 font-mono text-sm border-border focus-visible:ring-emerald-500 bg-card" 
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Input 
                      placeholder="Value" 
                      value={env.value} 
                      onChange={(e) => handleEnvChange(idx, 'value', e.target.value)}
                      type="password" 
                      className="h-10 font-mono text-sm border-border focus-visible:ring-emerald-500 bg-card" 
                    />
                  </div>
                  <Button onClick={() => removeEnv(idx)} variant="outline" className="h-10 w-10 p-0 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 border-border hover:border-red-500/30 hover:bg-red-500/10 shrink-0 bg-card">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {envs.length === 0 && (
                <div className="text-center py-6 text-sm text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
                  No environment variables configured.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar Settings Column */}
        <div className="space-y-6">
          
          {/* Domain Configuration */}
          <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
            <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" /> Custom Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Map a custom domain to this project. We will automatically provision an SSL certificate via Let's Encrypt.
              </p>
              <div className="space-y-2">
                <Label className="text-[13px] text-foreground font-semibold">Domain Name</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="www.example.com" 
                    value={domain}
                    onChange={(e) => { setDomain(e.target.value); setIsDirty(true); }}
                    className="h-9 text-sm border-border focus-visible:ring-indigo-500 bg-card" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-500/20 shadow-sm rounded-2xl overflow-hidden bg-card p-0 gap-0">
            <CardHeader className="border-b border-red-500/20 bg-red-500/10 pt-6 px-6 pb-4">
              <CardTitle className="text-base text-red-600 dark:text-red-400 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permanently remove this project and all of its associated containers, logs, and environments. This action cannot be undone.
              </p>
              <Button 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="w-full bg-card text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/30 font-bold transition-colors"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete Project
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

      <Dialog open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Discard Unsaved Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes in your project settings. Are you sure you want to leave this page? Your changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowDiscardModal(false)}>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={confirmDiscard}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
