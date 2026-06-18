import api from "@/lib/api";
import { LoginFormSchema, RegisterFormSchema } from "@/lib/validations/auth";
import { User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  login: async (data: LoginFormSchema): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  register: async (data: RegisterFormSchema): Promise<AuthResponse> => {
    const { confirmPassword, ...payload } = data;
    const res = await api.post("/auth/register", payload);
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  logout: async (): Promise<{ message: string }> => {
    const res = await api.post("/auth/logout");
    return res.data;
  },

  updateProfile: async (data: { name: string; email: string }): Promise<User> => {
    const res = await api.post("/auth/profile", data);
    return res.data;
  },

  updatePassword: async (data: any): Promise<{ message: string }> => {
    const res = await api.post("/auth/password", data);
    return res.data;
  },

  generateSshKey: async (): Promise<{ sshPublicKey: string }> => {
    const res = await api.post("/auth/ssh-key");
    return res.data;
  },

  connectGithub: async (token: string): Promise<{ githubUsername: string }> => {
    const res = await api.post("/auth/github", { token });
    return res.data;
  },

  disconnectGithub: async (): Promise<{ message: string }> => {
    const res = await api.delete("/auth/github");
    return res.data;
  },
};
