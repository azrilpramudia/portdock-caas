import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Server, Globe } from "lucide-react";

interface SettingsGeneralProps {
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  setIsDirty: (v: boolean) => void;
}

export function SettingsGeneral({
  name, setName,
  description, setDescription,
  domain, setDomain,
  setIsDirty
}: SettingsGeneralProps) {
  return (
    <>
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

      <Card className="bg-card border-border shadow-sm rounded-2xl overflow-hidden border p-0 gap-0">
        <CardHeader className="border-b border-border bg-muted/50 pt-6 px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-foreground" /> Domains
          </CardTitle>
          <CardDescription>Custom domain configuration for this project.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground font-semibold">Domain Name</Label>
            <Input 
              placeholder="example.com"
              value={domain} 
              onChange={(e) => { setDomain(e.target.value); setIsDirty(true); }}
              className="h-11 border-border focus-visible:ring-blue-500 bg-card" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Note: You need to configure a CNAME record pointing to portdock.app for this to work.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
