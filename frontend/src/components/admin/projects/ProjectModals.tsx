import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  useDeleteAdminProject, 
  useUpdateAdminProject,
  useSuspendAdminProject,
  useResumeAdminProject,
  useResetAdminProjectStatus
} from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PauseCircle, RefreshCw, PlayCircle } from "lucide-react";

export function ViewProjectModal({ isOpen, onClose, project }: { isOpen: boolean, onClose: () => void, project: any }) {
  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Details</DialogTitle>
          <DialogDescription>
            Detailed information about the project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Project Name</Label>
              <div className="font-medium mt-1">{project.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Domain</Label>
              <div className="font-medium mt-1">{project.domain || "-"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <Badge variant="outline">{project.status}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Template</Label>
              <div className="font-medium mt-1">{project.templateId || "Unknown"}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Owner</Label>
              <div className="font-medium mt-1">{project.user?.name}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <div className="font-medium mt-1">
                {format(new Date(project.createdAt), "dd MMM yyyy HH:mm", { locale: id })}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors w-full sm:w-auto"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EditProjectModal({ isOpen, onClose, project }: { isOpen: boolean, onClose: () => void, project: any }) {
  const updateProjectMutation = useUpdateAdminProject();
  const suspendMutation = useSuspendAdminProject();
  const resumeMutation = useResumeAdminProject();
  const resetMutation = useResetAdminProjectStatus();
  
  const [projectToEdit, setProjectToEdit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"SUSPEND" | "RESET" | "RESUME" | null>(null);

  useEffect(() => {
    if (project && isOpen) {
      setProjectToEdit({ ...project });
      setConfirmAction(null);
    }
  }, [project, isOpen]);

  const handleEditSubmit = () => {
    if (!projectToEdit) return;
    setIsSubmitting(true);
    
    const dataToSend = { 
      name: projectToEdit.name,
      domain: projectToEdit.domain,
      status: projectToEdit.status,
    };

    updateProjectMutation.mutate({ id: projectToEdit.id, data: dataToSend }, {
      onSuccess: () => {
        setIsSubmitting(false);
        toast.success("Project updated successfully");
        onClose();
      },
      onError: (error: any) => {
        setIsSubmitting(false);
        const msg = error.response?.data?.message;
        const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to update project";
        toast.error(errorMessage);
      }
    });
  };

  const executeConfirmAction = () => {
    if (!projectToEdit) return;
    setIsSubmitting(true);

    if (confirmAction === "RESET") {
      resetMutation.mutate(projectToEdit.id, {
        onSuccess: () => {
          toast.success("Project status reset to FAILED");
          setIsSubmitting(false);
          onClose();
        },
        onError: () => {
          toast.error("Failed to reset status");
          setIsSubmitting(false);
        }
      });
    } else if (confirmAction === "SUSPEND") {
      suspendMutation.mutate(projectToEdit.id, {
        onSuccess: () => {
          toast.success("Project suspended and containers stopped");
          setIsSubmitting(false);
          onClose();
        },
        onError: () => {
          toast.error("Failed to suspend project");
          setIsSubmitting(false);
        }
      });
    } else if (confirmAction === "RESUME") {
      resumeMutation.mutate(projectToEdit.id, {
        onSuccess: () => {
          toast.success("Project resumed and containers started");
          setIsSubmitting(false);
          onClose();
        },
        onError: () => {
          toast.error("Failed to resume project");
          setIsSubmitting(false);
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {confirmAction ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className={`w-5 h-5 ${confirmAction === 'RESUME' ? 'text-green-500' : 'text-amber-500'}`} />
                {confirmAction === "SUSPEND" && "Confirm Suspension"}
                {confirmAction === "RESET" && "Confirm Reset"}
                {confirmAction === "RESUME" && "Confirm Resume"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "SUSPEND" && "Are you sure you want to suspend this project? This action will STOP all running containers associated with it."}
                {confirmAction === "RESET" && "Are you sure you want to reset this stuck build? This will forcefully change the status to FAILED."}
                {confirmAction === "RESUME" && "Are you sure you want to resume this project? This action will START all stopped containers associated with it."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <button 
                onClick={() => setConfirmAction(null)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeConfirmAction}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmAction === "SUSPEND" ? "bg-red-500 hover:bg-red-600" : 
                  confirmAction === "RESUME" ? "bg-green-500 hover:bg-green-600" :
                  "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, I'm sure"}
              </button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>
                Update project configuration and status.
              </DialogDescription>
            </DialogHeader>
            {projectToEdit && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Project Name</Label>
                  <Input 
                    id="edit-name" 
                    value={projectToEdit.name} 
                    onChange={(e) => setProjectToEdit({...projectToEdit, name: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-domain">Domain</Label>
                  <Input 
                    id="edit-domain" 
                    value={projectToEdit.domain || ""} 
                    onChange={(e) => setProjectToEdit({...projectToEdit, domain: e.target.value})} 
                    placeholder="example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-md border border-border">
                    <Badge variant={projectToEdit.status === 'ACTIVE' ? 'default' : 'outline'}>
                      {projectToEdit.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Status is automatically managed by the system.
                    </span>
                  </div>
                </div>
                
                {/* Administrative Actions */}
                <div className="mt-4 border-t border-border pt-4">
                  <Label className="text-muted-foreground mb-3 block">Administrative Actions</Label>
                  <div className="flex flex-col gap-2">
                    {projectToEdit.status === 'BUILDING' && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setConfirmAction("RESET")}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-amber-200 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-500 w-full"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reset Stuck Status (Force FAILED)
                      </button>
                    )}
                    
                    {projectToEdit.status !== 'INACTIVE' && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setConfirmAction("SUSPEND")}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-red-200 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-500 w-full"
                      >
                        <PauseCircle className="w-4 h-4" />
                        Suspend Project (Force INACTIVE)
                      </button>
                    )}
                    
                    {projectToEdit.status === 'INACTIVE' && (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => setConfirmAction("RESUME")}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium border border-green-200 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors dark:border-green-900/30 dark:bg-green-900/10 dark:text-green-500 w-full"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Resume Project (Force ACTIVE)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4">
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleEditSubmit}
                disabled={isSubmitting || !projectToEdit?.name}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProjectModal({ isOpen, onClose, project }: { isOpen: boolean, onClose: () => void, project: any | null }) {
  const deleteProjectMutation = useDeleteAdminProject();

  const confirmDelete = () => {
    if (project) {
      deleteProjectMutation.mutate(project.id, {
        onSuccess: () => {
          toast.success("Project deleted successfully");
          onClose();
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message;
          const errorMessage = Array.isArray(msg) ? msg[0] : msg || "Failed to delete project";
          toast.error(errorMessage);
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete project <span className="font-semibold text-foreground">{project?.name}</span>? This action cannot be undone and will permanently remove all associated containers and data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-input rounded-md hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={confirmDelete}
            disabled={deleteProjectMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleteProjectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
