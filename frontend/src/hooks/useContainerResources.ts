import { useState } from "react";
import { containersService } from "@/services/containers.service";
import { toast } from "sonner";

export function useContainerResources(container: any, onRefresh?: () => void) {
  const [memoryLimit, setMemoryLimit] = useState<number>(container.memoryLimit || 512);
  const [cpuLimit, setCpuLimit] = useState<number>(container.cpuLimit || 0.5);
  const [restartPolicy, setRestartPolicy] = useState<string>(container.restartPolicy || 'unless-stopped');
  const [volumeMountPath, setVolumeMountPath] = useState<string>(container.volumeMountPath || '');
  const [isSavingResources, setIsSavingResources] = useState(false);

  const handleSaveResources = async () => {
    setIsSavingResources(true);
    try {
      await containersService.updateResources(container.id, { 
        memoryLimit, 
        cpuLimit, 
        restartPolicy,
        volumeMountPath: volumeMountPath.trim() === '' ? null : volumeMountPath.trim(),
      });
      toast.success("Settings updated successfully");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSavingResources(false);
    }
  };

  return {
    memoryLimit, setMemoryLimit,
    cpuLimit, setCpuLimit,
    restartPolicy, setRestartPolicy,
    volumeMountPath, setVolumeMountPath,
    isSavingResources,
    handleSaveResources
  };
}
