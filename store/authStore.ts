import { create } from "zustand";
import { User, LoginRequest, RegisterRequest } from "@/types/auth";
import { authService } from "@/services/authService";
import {
  clearTokens,
  hasValidAccessToken,
  saveTokens,
} from "@/lib/tokenStorage";
import { useCustomMaterialStore } from "./customMaterialStore";
import { useSubscriptionStore } from "./subscriptionStore";
import { useNotificationStore } from "./notificationStore";

// 🔐 SECURITY: Temporary localStorage token storage (Sprint 3)
// Tokens are saved in localStorage for implementation speed
// AuthState keeps user/session data only (no tokens in memory)
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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start with true to prevent flash of unauthenticated content
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      saveTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenType: response.tokenType,
        expiresIn: response.expiresIn,
      });

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
      await authService.register(data);

      // Auto-login after successful registration to obtain tokens
      await get().login({
        email: data.email,
        password: data.password,
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
      if (hasValidAccessToken()) {
        await authService.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
      
      // Reset all other stores to prevent state leakage between users
      useCustomMaterialStore.getState().reset();
      useSubscriptionStore.getState().reset();
      useNotificationStore.getState().reset();
      
      // Always clear local state
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      if (!hasValidAccessToken()) {
        clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const user = await authService.getProfile();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearTokens();
      // Token invalid or expired - suppress error, just set unauthenticated state
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
