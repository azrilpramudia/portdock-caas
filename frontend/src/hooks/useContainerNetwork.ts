import { useState } from "react";
import { containersService } from "@/services/containers.service";
import { toast } from "sonner";

export function useContainerNetwork(container: any, onRefresh?: () => void) {
  const [newPort, setNewPort] = useState<string>('');
  const [isCreatingAllocation, setIsCreatingAllocation] = useState(false);
  const [allocations, setAllocations] = useState([{
    hostPort: container.hostPort,
    internalPort: container.internalPort || 80,
    isPrimary: true
  }].filter(a => a.hostPort));

  const handleCreateAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    const portNumber = parseInt(newPort);
    
    if (isNaN(portNumber)) {
      toast.error("Format port tidak valid");
      return;
    }

    if (portNumber < 19000 || portNumber > 25999) {
      toast.error("Port ditolak! Anda hanya diizinkan memilih port antara 19000 - 25999.");
      return;
    }

    if (allocations.find(a => a.hostPort === portNumber)) {
      toast.error("Port ini sudah Anda miliki.");
      return;
    }

    setIsCreatingAllocation(true);
    try {
      await containersService.allocatePort(container.id, portNumber);
      setAllocations([{ hostPort: portNumber, internalPort: container.internalPort || 80, isPrimary: true }]);
      toast.success(`Port ${portNumber} berhasil dialokasikan!`);
      setNewPort('');
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengalokasikan port");
    } finally {
      setIsCreatingAllocation(false);
    }
  };

  const handleRemovePort = async () => {
    try {
      await containersService.removePort(container.id);
      setAllocations([]);
      toast.success(`Port berhasil dihapus!`);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus port");
    }
  };

  const [internalPort, setInternalPort] = useState<number | ''>(container.internalPort || 80);
  const [isUpdatingInternalPort, setIsUpdatingInternalPort] = useState(false);

  const handleUpdateInternalPort = async () => {
    if (internalPort === '') return;
    setIsUpdatingInternalPort(true);
    try {
      await containersService.updateInternalPort(container.id, internalPort);
      toast.success("Target internal port berhasil diperbarui");
      if (onRefresh) onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui target internal port");
    } finally {
      setIsUpdatingInternalPort(false);
    }
  };

  return {
    newPort,
    setNewPort,
    isCreatingAllocation,
    allocations,
    handleCreateAllocation,
    handleRemovePort,
    internalPort,
    setInternalPort,
    isUpdatingInternalPort,
    handleUpdateInternalPort
  };
}
