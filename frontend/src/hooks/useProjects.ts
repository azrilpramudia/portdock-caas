import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsService } from "@/services/projects.service";
import { toast } from "sonner";

export const useProjectsList = (search: string, statusFilter: string) => {
  return useQuery({
    queryKey: ["projects", search, statusFilter],
    queryFn: () => {
      const params: Record<string, string | number> = { limit: 20 };
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "all") params.status = statusFilter;
      return projectsService.getProjects(params);
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => projectsService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project berhasil dibuat");
    },
    onError: () => toast.error("Gagal membuat project"),
  });
};

export const useDeleteProject = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project berhasil dihapus");
      if (onSuccess) onSuccess();
    },
    onError: () => toast.error("Gagal menghapus project"),
  });
};
