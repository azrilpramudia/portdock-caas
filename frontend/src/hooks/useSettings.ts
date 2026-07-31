import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import { AxiosError } from "axios";

export function useProfileSettings() {
  const { user, token, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: authService.getMe,
    staleTime: Infinity,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      if (token) setAuth(updatedUser, token);
      queryClient.setQueryData(["profile"], updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  return { profileQuery, updateProfileMutation };
}

export function useSecuritySettings() {
  const updatePasswordMutation = useMutation({
    mutationFn: authService.updatePassword,
    onSuccess: () => {
      toast.success("Password updated successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update password");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete('/auth/me');
      return res.data;
    },
  });

  return { updatePasswordMutation, deleteAccountMutation };
}

export function useTwoFactorSettings() {
  const { updateUser } = useAuthStore();

  const setup2faMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/2fa/setup');
      return res.data as { qrCode: string; manualKey: string };
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to initiate 2FA setup");
    },
  });

  const verify2faMutation = useMutation({
    mutationFn: async (data: { token: string }) => {
      const res = await api.post('/auth/2fa/verify', data);
      return res.data;
    },
    onSuccess: () => {
      updateUser({ isTwoFactorEnabled: true });
      toast.success("Two-Factor Authentication is now enabled");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Invalid verification code");
    },
  });

  const disable2faMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/2fa/turn-off');
      return res.data;
    },
    onSuccess: () => {
      updateUser({ isTwoFactorEnabled: false });
      toast.success("Two-Factor Authentication has been disabled");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to disable 2FA");
    },
  });

  return { setup2faMutation, verify2faMutation, disable2faMutation };
}

export function useIntegrationSettings() {
  const { user, token, setAuth } = useAuthStore();

  const generateSshKeyMutation = useMutation({
    mutationFn: authService.generateSshKey,
    onSuccess: (data) => {
      if (user && token) {
        setAuth({ ...user, sshPublicKey: data.sshPublicKey }, token);
      }
      toast.success("SSH Key generated successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to generate SSH key");
    },
  });

  const connectGithubMutation = useMutation({
    mutationFn: authService.connectGithub,
    onSuccess: (data) => {
      if (user && token) {
        setAuth({ ...user, githubUsername: data.githubUsername }, token);
      }
      toast.success("GitHub connected successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to connect GitHub");
    },
  });

  const disconnectGithubMutation = useMutation({
    mutationFn: authService.disconnectGithub,
    onSuccess: () => {
      if (user && token) {
        setAuth({ ...user, githubUsername: undefined }, token);
      }
      toast.success("GitHub disconnected successfully!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to disconnect GitHub");
    },
  });

  return { generateSshKeyMutation, connectGithubMutation, disconnectGithubMutation };
}
