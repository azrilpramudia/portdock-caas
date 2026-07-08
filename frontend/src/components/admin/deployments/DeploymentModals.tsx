import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Terminal } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DeploymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: any;
  getStatusBadge: (status: string) => React.ReactNode;
  calculateDuration: (startedAt: string, endedAt: string | null) => string;
}

export function DeploymentDetailsModal({ 
  isOpen, 
  onClose, 
  deployment,
  getStatusBadge,
  calculateDuration
}: DeploymentDetailsModalProps) {
  if (!deployment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Deployment Details</DialogTitle>
          <DialogDescription>
            Detailed information about this deployment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">ID:</span>
            <span className="col-span-3 text-sm font-mono text-muted-foreground">{deployment.id}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Project:</span>
            <span className="col-span-3 text-sm font-medium text-foreground">{deployment.project?.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Status:</span>
            <span className="col-span-3 text-sm">{getStatusBadge(deployment.status)}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Progress:</span>
            <span className="col-span-3 text-sm font-medium text-foreground">{deployment.progress}%</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Started At:</span>
            <span className="col-span-3 text-sm text-muted-foreground">{format(new Date(deployment.startedAt), "dd MMM yyyy, HH:mm:ss", { locale: id })}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Ended At:</span>
            <span className="col-span-3 text-sm text-muted-foreground">{deployment.endedAt ? format(new Date(deployment.endedAt), "dd MMM yyyy, HH:mm:ss", { locale: id }) : '-'}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Duration:</span>
            <span className="col-span-3 text-sm font-medium text-foreground">{calculateDuration(deployment.startedAt, deployment.endedAt)}</span>
          </div>
          {deployment.domain && (
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="font-semibold text-right text-sm text-slate-700 dark:text-slate-300">Domain:</span>
              <a href={`http://${deployment.domain}`} target="_blank" rel="noreferrer" className="col-span-3 text-sm text-blue-500 hover:underline">
                {deployment.domain}
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DeploymentLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deployment: any;
}

export function DeploymentLogsModal({ isOpen, onClose, deployment }: DeploymentLogsModalProps) {
  if (!deployment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Build Logs</DialogTitle>
          <DialogDescription>
            Terminal output for {deployment.project?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-slate-950 text-slate-300 font-mono text-[13px] p-5 rounded-md h-[400px] overflow-y-auto mt-2 border border-slate-700/50">
          <div className="flex flex-col gap-1.5">
            <div className="text-blue-400 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Starting deployment process...</span>
            </div>
            <div>&gt; Fetching project configuration for <span className="font-bold text-white">{deployment.project?.name}</span></div>
            <div className="text-emerald-400">✓ Configuration loaded successfully.</div>
            <div>&gt; Pulling dependencies...</div>
            <div>&gt; Building Docker image...</div>
            <div className="text-slate-500">Step 1/5 : FROM node:18-alpine</div>
            <div className="text-slate-500">Step 2/5 : WORKDIR /app</div>
            <div className="text-slate-500">Step 3/5 : COPY package*.json ./</div>
            <div className="text-slate-500">Step 4/5 : RUN npm install</div>
            <div className="text-slate-500">Step 5/5 : COPY . .</div>
            <div>&gt; Exporting image...</div>
            
            <div className="mt-4 border-t border-slate-700/50 pt-4">
              {deployment.status === "Success" ? (
                <div className="text-emerald-400 font-medium">✓ Deployment completed successfully. Container is now running.</div>
              ) : deployment.status === "Failed" ? (
                <div className="text-rose-400 font-medium">✗ Deployment failed: Build process exited with error code 1.</div>
              ) : (
                <div className="text-blue-400 animate-pulse font-medium">... Processing ...</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
