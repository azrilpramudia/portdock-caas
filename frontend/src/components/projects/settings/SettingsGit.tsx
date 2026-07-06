import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GitBranch, Terminal } from "lucide-react";

interface SettingsGitProps {
  repositoryUrl: string;
  setRepositoryUrl: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  buildCommand: string;
  setBuildCommand: (v: string) => void;
  startCommand: string;
  setStartCommand: (v: string) => void;
  setIsDirty: (v: boolean) => void;
}

export function SettingsGit({
  repositoryUrl, setRepositoryUrl,
  branch, setBranch,
  buildCommand, setBuildCommand,
  startCommand, setStartCommand,
  setIsDirty
}: SettingsGitProps) {
  return (
    <>
      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
        <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-foreground" /> Deployment Source
          </CardTitle>
          <CardDescription>Connect to a Git repository for continuous deployment.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Repository URL</Label>
            <Input 
              placeholder="https://github.com/username/repo"
              value={repositoryUrl} 
              onChange={(e) => { setRepositoryUrl(e.target.value); setIsDirty(true); }}
              className="h-11 border-border focus-visible:ring-blue-500 bg-card" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Branch</Label>
            <Input 
              placeholder="main"
              value={branch} 
              onChange={(e) => { setBranch(e.target.value); setIsDirty(true); }}
              className="h-11 border-border focus-visible:ring-blue-500 bg-card" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
        <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-600" /> Build & Run Settings
          </CardTitle>
          <CardDescription>Customize how your application is built and started.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Build Command</Label>
            <Input 
              placeholder="npm run build"
              value={buildCommand} 
              onChange={(e) => { setBuildCommand(e.target.value); setIsDirty(true); }}
              className="h-11 border-border focus-visible:ring-orange-500 bg-card font-mono text-sm" 
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Start Command</Label>
            <Input 
              placeholder="npm start"
              value={startCommand} 
              onChange={(e) => { setStartCommand(e.target.value); setIsDirty(true); }}
              className="h-11 border-border focus-visible:ring-orange-500 bg-card font-mono text-sm" 
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
