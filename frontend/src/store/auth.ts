import { create } from "zustand";

import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitializing: true,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const { authService } = await import("@/services/auth.service");
      await authService.logout();
    } catch {
      // ignore
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  initialize: async () => {
    set({ isInitializing: true });
    try {
      const { fetchAndSetCsrfToken } = await import("@/lib/api");
      await fetchAndSetCsrfToken();
      
      const { authService } = await import("@/services/auth.service");
      const user = await authService.getMe();
      if (user) {
        set({ user, isAuthenticated: true, token: "cookie-based", isInitializing: false });
      } else {
        set({ isInitializing: false });
      }
    } catch {
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false });
    }
  },
}));
