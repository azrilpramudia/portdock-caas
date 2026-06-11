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
};
