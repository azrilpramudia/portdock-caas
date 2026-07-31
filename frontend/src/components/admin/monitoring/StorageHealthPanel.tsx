import { HardDrive, Box, Image as ImageIcon, Database, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface StorageHealthPanelProps {
  data: {
    imagesSize: number;
    containersSize: number;
    volumesSize: number;
    totalSize: number;
  };
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function StorageHealthPanel({ data }: StorageHealthPanelProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const pruneMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/docker/prune');
      return response.data;
    },
    onSuccess: () => {
      toast.success("Docker system pruned successfully!");
      setIsConfirming(false);
      // We don't invalidate here, the periodic dashboard refresh will fetch the new sizes.
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to prune system");
      setIsConfirming(false);
    }
  });

  const handlePrune = () => {
    if (isConfirming) {
      pruneMutation.mutate();
    } else {
      setIsConfirming(true);
      // Auto cancel after 5 seconds if not confirmed
      setTimeout(() => setIsConfirming(false), 5000);
    }
  };

  // Prevent divide by zero
  const safeTotal = data?.totalSize || 1;
  const imagesPct = data ? (data.imagesSize / safeTotal) * 100 : 0;
  const volumesPct = data ? (data.volumesSize / safeTotal) * 100 : 0;
  const containersPct = data ? (data.containersSize / safeTotal) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex-1 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-blue-500" />
          Docker Storage Health
        </h3>
      </div>

      <div className="space-y-5">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <ImageIcon className="w-4 h-4 text-emerald-500" /> Images
          </div>
          <span className="font-semibold text-foreground">{formatBytes(data?.imagesSize || 0)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Database className="w-4 h-4 text-purple-500" /> Volumes (DB Data)
          </div>
          <span className="font-semibold text-foreground">{formatBytes(data?.volumesSize || 0)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Box className="w-4 h-4 text-blue-500" /> Containers (R/W Layer)
          </div>
          <span className="font-semibold text-foreground">{formatBytes(data?.containersSize || 0)}</span>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-muted-foreground">Total Docker Usage</span>
            <span className="font-bold text-foreground">{formatBytes(data?.totalSize || 0)}</span>
          </div>
          {/* Progress Bar */}
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
            {imagesPct > 0 && <div style={{ width: `${imagesPct}%` }} className="bg-emerald-500" title="Images" />}
            {volumesPct > 0 && <div style={{ width: `${volumesPct}%` }} className="bg-purple-500" title="Volumes" />}
            {containersPct > 0 && <div style={{ width: `${containersPct}%` }} className="bg-blue-500" title="Containers" />}
          </div>
        </div>

        <div className="pt-4 border-t border-border mt-2">
          <Button 
            variant={isConfirming ? "destructive" : "secondary"} 
            className="w-full relative overflow-hidden transition-all"
            onClick={handlePrune}
            disabled={pruneMutation.isPending}
          >
            {pruneMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : isConfirming ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2 text-destructive" />
            )}
            {pruneMutation.isPending 
              ? "Pruning System..." 
              : isConfirming 
                ? "Click again to confirm!" 
                : "Prune Unused Data"}
          </Button>
          {!isConfirming && (
            <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
              Removes all stopped containers, unused networks, dangling images, and unused volumes safely.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
