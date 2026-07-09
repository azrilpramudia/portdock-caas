import { 
  Eye, 
  Terminal, 
  MoreVertical, 
  Play, 
  RotateCw, 
  Trash2, 
  PauseCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useAdminContainerAction } from "@/hooks/useAdminContainers";
import { toast } from "sonner";

interface ContainerRowActionsProps {
  container: any;
  onView: (container: any) => void;
}

export function ContainerRowActions({ container, onView }: ContainerRowActionsProps) {
  const router = useRouter();
  const { mutate: performAction, isPending } = useAdminContainerAction();

  const handleAction = (containerId: string, action: 'start'|'stop'|'restart'|'delete') => {
    const actionText = action === 'start' ? 'menyalakan' : action === 'stop' ? 'mematikan' : action === 'restart' ? 'memulai ulang' : 'menghapus';
    performAction({ id: containerId, action }, {
      onSuccess: () => toast.success(`Berhasil ${actionText} kontainer!`),
      onError: (err: any) => toast.error(`Gagal ${actionText} kontainer: ${err.message}`)
    });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger render={
            <Button 
              aria-label="Lihat detail kontainer" 
              onClick={() => onView(container)} 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          } />
          <TooltipContent>
            <p>Lihat Detail</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {container.status === 'RUNNING' && (
        <TooltipProvider delay={300}>
          <Tooltip>
            <TooltipTrigger render={
              <Button 
                aria-label="Buka terminal kontainer" 
                variant="outline" 
                size="icon" 
                onClick={() => router.push(`/admin/terminal?containerId=${container.id}`)} 
                className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
              >
                <Terminal className="w-4 h-4" />
              </Button>
            } />
            <TooltipContent>
              <p>Buka Terminal</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {container.status === 'STOPPED' && (
        <TooltipProvider delay={300}>
          <Tooltip>
            <TooltipTrigger render={
              <Button 
                onClick={() => handleAction(container.id, 'start')} 
                disabled={isPending} 
                variant="outline" 
                size="icon" 
                className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
              >
                <Play className="w-4 h-4" />
              </Button>
            } />
            <TooltipContent>
              <p>Start Container</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {(container.status === 'ERROR' || container.status === 'FAILED') && (
        <>
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger render={
                <Button 
                  onClick={() => handleAction(container.id, 'restart')} 
                  disabled={isPending} 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              } />
              <TooltipContent>
                <p>Restart Container</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger render={
                <Button 
                  onClick={() => handleAction(container.id, 'delete')} 
                  disabled={isPending} 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-lg bg-card border-rose-100 dark:border-rose-900/30 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-none shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              } />
              <TooltipContent>
                <p>Delete Container</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      {(container.status === 'RUNNING' || container.status === 'STOPPED') && (
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-lg bg-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shadow-none shrink-0"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          } />
          <DropdownMenuContent align="end">
            {container.status === 'RUNNING' && (
              <DropdownMenuItem onClick={() => handleAction(container.id, 'stop')} disabled={isPending}>
                <PauseCircle className="w-4 h-4 mr-2" /> Stop Container
              </DropdownMenuItem>
            )}
            {container.status === 'RUNNING' && (
              <DropdownMenuItem onClick={() => handleAction(container.id, 'restart')} disabled={isPending}>
                <RotateCw className="w-4 h-4 mr-2" /> Restart Container
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => handleAction(container.id, 'delete')} disabled={isPending}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete Container
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
