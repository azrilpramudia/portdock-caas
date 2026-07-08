import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SettingsTab } from "@/components/containers/details/SettingsTab";
import { useContainerResources } from "@/hooks/useContainerResources";

interface ViewContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: any;
}

export function ViewContainerModal({ isOpen, onClose, container }: ViewContainerModalProps) {
  const [copied, setCopied] = useState(false);
  const resourcesState = useContainerResources(container || {}, () => {
    // Optionally refresh admin data here if needed
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("JSON berhasil disalin!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-4xl w-full max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Container Details: {container?.name}</DialogTitle>
          <DialogDescription>Full properties of the selected container.</DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-2 flex-1 flex flex-col overflow-hidden">
          <TabsList className="mb-2 w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="json">Raw JSON</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="flex-1 overflow-y-auto outline-none">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pr-2 pb-2">
              {container && [
                { label: 'Container Name', value: container.name },
                { label: 'Docker ID', value: container.dockerContainerId?.substring(0, 12) || '-' },
                { label: 'Image', value: `${container.imageName}:${container.imageTag}` },
                { label: 'Project', value: container.project?.name || '-' },
                { label: 'Domain', value: container.project?.domain || container.subdomain || '-' },
                { label: 'Status', value: container.status },
                { label: 'Memory Limit', value: container.memoryLimit ? `${container.memoryLimit} MB` : 'Unlimited' },
                { label: 'CPU Limit', value: container.cpuLimit ? `${container.cpuLimit} Core` : 'Unlimited' },
                { label: 'Port Mapping', value: container.hostPort ? `${container.hostPort} ➔ ${container.internalPort}` : '-' },
                { label: 'Restart Policy', value: container.restartPolicy || 'Unless Stopped' },
                { label: 'Volume Mount', value: container.volumeMountPath || 'None' },
                { label: 'Created At', value: container.createdAt ? new Date(container.createdAt).toLocaleString('id-ID') : '-' },
              ].map((item, idx) => (
                <div key={idx} className="bg-muted/50 border border-border/50 rounded-lg p-3 flex flex-col gap-1 transition-colors hover:bg-muted">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground truncate" title={String(item.value)}>{item.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="flex-1 flex flex-col overflow-hidden outline-none">
            <div className="relative flex-1 bg-muted/30 border border-border rounded-lg flex flex-col overflow-hidden">
              <Button 
                size="icon-sm" 
                variant="ghost" 
                className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 backdrop-blur-sm z-10 border border-border"
                onClick={() => handleCopy(JSON.stringify(container, null, 2))}
                aria-label="Salin JSON"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </Button>
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
                <pre className="text-foreground text-[10px] sm:text-xs whitespace-pre-wrap break-all m-0">
                  {container ? JSON.stringify(container, null, 2) : ''}
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-y-auto outline-none pr-2 pb-2">
            {container && (
              <SettingsTab 
                container={container}
                memoryLimit={resourcesState.memoryLimit}
                setMemoryLimit={resourcesState.setMemoryLimit}
                cpuLimit={resourcesState.cpuLimit}
                setCpuLimit={resourcesState.setCpuLimit}
                restartPolicy={resourcesState.restartPolicy}
                setRestartPolicy={resourcesState.setRestartPolicy}
                volumeMountPath={resourcesState.volumeMountPath}
                setVolumeMountPath={resourcesState.setVolumeMountPath}
                handleSaveResources={resourcesState.handleSaveResources}
                isSavingResources={resourcesState.isSavingResources}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
