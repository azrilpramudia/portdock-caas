import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { containersService } from "@/services/containers.service";
import { toast } from "sonner";

export const useContainersList = (search: string, statusFilter: string) => {
  return useQuery({
    queryKey: ["containers", search, statusFilter],
    queryFn: () => {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return containersService.getContainers(params);
    },
    refetchInterval: 5000,
  });
};

export const useContainerAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) => 
      containersService.actionContainer(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Aksi container berhasil");
    },
    onError: () => toast.error("Gagal melakukan aksi container"),
  });
};

export const useDeleteContainer = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => containersService.deleteContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] });
      toast.success("Container berhasil dihapus");
      if (onSuccess) onSuccess();
    },
    onError: () => toast.error("Gagal menghapus container"),
  });
};
