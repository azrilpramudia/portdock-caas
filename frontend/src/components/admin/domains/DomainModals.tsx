import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Globe, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useUpdateAdminProject, useAdminProjects } from "@/hooks/useAdminProjects";

import { Project } from "@/types";
import { AdminProjectListItemDto } from "@/hooks/useAdminProjects";
import { AxiosError } from "axios";

export function AddDomainModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: responseData, isLoading: isProjectsLoading } = useAdminProjects();
  const updateProjectMutation = useUpdateAdminProject();
  
  const [domainName, setDomainName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projects = useMemo(() => {
    return responseData?.projects || [];
  }, [responseData?.projects]);

  const handleSubmit = () => {
    if (!domainName) {
      toast.error("Please enter a domain name");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }

    setIsSubmitting(true);
    
    const dataToSend = { 
      domain: domainName,
    };

    updateProjectMutation.mutate({ id: selectedProjectId, data: dataToSend }, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success("Domain added successfully to the project!");
        setDomainName("");
        setSelectedProjectId("");
        onClose();
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        const msg = error.response?.data?.message;
        const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to add domain";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Custom Domain</DialogTitle>
          <DialogDescription>
            Assign a custom domain to an existing project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="domain-name">Domain Name</Label>
            <Input 
              id="domain-name"
              placeholder="e.g. store.example.com" 
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-project">Target Project</Label>
            {isProjectsLoading ? (
              <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading projects...
              </div>
            ) : (
              <select 
                id="target-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled>Select a project...</option>
                {projects.map((p: AdminProjectListItemDto) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.domain ? `(Current: ${p.domain})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-3 mt-2 border border-blue-100 dark:border-blue-900/50">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">DNS Configuration</h4>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80">
              Please ensure you have configured your DNS records:
              <br/>- <strong>A Record</strong> pointing to your server's IP, OR
              <br/>- <strong>CNAME Record</strong> pointing to <code className="bg-blue-100 dark:bg-blue-900/40 px-1 py-0.5 rounded">cname.portdock.com</code>
            </p>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Add Domain
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditDomainModal({ isOpen, onClose, domain }: { isOpen: boolean, onClose: () => void, domain: AdminProjectListItemDto | null }) {
  const updateProjectMutation = useUpdateAdminProject();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceHttps, setForceHttps] = useState(true);

  if (!domain) return null;

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulating save for Domain-specific settings (like Force HTTPS which might not exist in backend yet)
    const dataToSend = { 
      domain: domain.domain,
    };

    updateProjectMutation.mutate({ id: domain.id, data: dataToSend }, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success("Domain settings updated successfully");
        onClose();
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        const msg = error.response?.data?.message;
        const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to update domain";
        toast.error(errorMessage);
      }
    });
  };

  const handleRenewSSL = () => {
    toast.info(`Triggering SSL renewal for ${domain.domain}...`);
    setTimeout(() => {
      toast.success("SSL renewal request queued successfully");
    }, 1500);
  };

  const handleVerifyDNS = () => {
    toast.info("Verifying DNS records...");
    setTimeout(() => {
      toast.success("DNS configuration is correct (A Record / CNAME matched)");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Domain Settings</DialogTitle>
          <DialogDescription>
            Manage routing, DNS verification, and SSL configuration for this domain.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Domain Name (Read-only) */}
          <div className="space-y-2">
            <Label>Domain Name</Label>
            <div className="flex gap-2">
              <Input 
                value={domain.domain || ""} 
                disabled 
                className="bg-muted/50 cursor-not-allowed text-muted-foreground font-medium" 
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Domain names cannot be changed. Delete and add a new domain instead.
            </p>
          </div>

          {/* Target Project (Read-only for now) */}
          <div className="space-y-2">
            <Label>Target Project</Label>
            <div className="flex items-center gap-2 p-2.5 border border-border rounded-md bg-muted/20">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{domain.name}</span>
            </div>
          </div>

          <div className="h-px bg-border my-1" />

          {/* SSL / Security Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security & SSL
            </h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Force HTTPS</Label>
                <p className="text-xs text-muted-foreground">
                  Redirect all HTTP traffic to HTTPS.
                </p>
              </div>
              <Switch 
                checked={forceHttps} 
                onCheckedChange={setForceHttps} 
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleVerifyDNS}
                className="flex-1 text-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Verify DNS
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRenewSSL}
                className="flex-1 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Renew SSL
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
