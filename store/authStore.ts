import { create } from "zustand";
import { User, LoginRequest, RegisterRequest } from "@/types/auth";
import { authService } from "@/services/authService";

// 🔐 SECURITY: NO token storage in client
// Tokens stored in httpOnly cookies (set by backend)
// AuthState contains ONLY user data and session state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with true to prevent flash of unauthenticated content
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      // 🔐 Backend sets httpOnly cookies via Set-Cookie header
      const response = await authService.login(credentials);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      const apiError = error as { response?: { data?: { message?: string } } };
      set({
        error: apiError.response?.data?.message || message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // 🔐 Backend sets httpOnly cookies via Set-Cookie header
      const response = await authService.register(data);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      const apiError = error as { response?: { data?: { message?: string } } };
      set({
        error: apiError.response?.data?.message || message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // 🔐 Call backend to clear httpOnly cookies
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      // 🔐 Backend validates httpOnly cookie and returns user data
      const user = await authService.getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Cookie invalid or expired - suppress error, just set unauthenticated state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  clearError: () => set({ error: null }),
}));
