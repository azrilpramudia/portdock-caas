import { create } from "zustand";

import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const { authService } = await import("@/services/auth.service");
      await authService.logout();
    } catch (e) {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    try {
      const { authService } = await import("@/services/auth.service");
      const user = await authService.getMe();
      if (user) {
        set({ user, isAuthenticated: true, token: "cookie-based" });
      }
    } catch (error) {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
