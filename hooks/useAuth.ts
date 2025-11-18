import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { hasActiveSession, redirectToLogin } from "@/lib/auth";

/**
 * Authentication Hook
 *
 * 🔐 Provides session management and authentication state.
 * Sprint 3 uses localStorage tokens temporarily (manually attached to requests).
 *
 * Features:
 * - Auto-loads user session on mount
 * - Checks session validity via backend
 * - Provides authentication actions
 * - Handles session initialization
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, isAuthenticated, isLoading } = useAuth();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAuthenticated) return <LoginPrompt />;
 *
 *   return <div>Welcome {user.email}</div>;
 * }
 * ```
 */
export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    loadUser,
    clearError,
  } = useAuthStore();

  /**
   * Initialize user session on mount
   *
   * 🔐 Calls backend to validate stored access token (via Authorization header).
   * If valid, loads user data into store.
   * If invalid, sets unauthenticated state.
   */
  useEffect(() => {
    // Only load once
    if (!isAuthenticated && !isLoading) {
      loadUser();
    }
  }, [isAuthenticated, isLoading, loadUser]);

  /**
   * Check if user has an active session
   *
   * 🔐 Calls backend to validate Authorization header (token stored in localStorage).
   * More reliable than checking local state.
   *
   * @returns Promise<boolean> - true if session is valid
   */
  const checkSession = async (): Promise<boolean> => {
    return await hasActiveSession();
  };

  /**
   * Require authentication
   *
   * Redirect to login if not authenticated.
   * Useful for protecting routes in components.
   *
   * @example
   * ```tsx
   * function ProtectedPage() {
   *   const { requireAuth } = useAuth();
   *
   *   useEffect(() => {
   *     requireAuth();
   *   }, [requireAuth]);
   *
   *   return <div>Protected content</div>;
   * }
   * ```
   */
  const requireAuth = () => {
    if (!isAuthenticated && !isLoading) {
      redirectToLogin(window.location.pathname);
    }
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,
    loadUser,
    clearError,

    // Utilities
    checkSession,
    requireAuth,
  };
}

/**
 * 🔐 SECURITY NOTES (Temporary Sprint 3 Strategy):
 *
 * Session Management:
 * - ✅ Backend validates Authorization header on every protected API call
 * - ✅ loadUser() calls backend to verify stored tokens (NOT decoded locally)
 * - ✅ checkSession() always queries backend (source of truth)
 * - ⚠️ Tokens live in localStorage until Sprint 6 httpOnly migration
 *
 * Token Refresh:
 * - ✅ Handled automatically by axios interceptor (lib/api.ts)
 * - ✅ On 401 response, interceptor posts refresh token to /auth/refresh
 * - ✅ Promise lock prevents concurrent refresh requests
 * - ✅ If refresh fails, tokens are cleared + redirect to login
 *
 * Auto-Logout Scenarios:
 * 1. Token refresh fails (401 → refresh → 401)
 * 2. User calls logout() action
 * 3. Backend invalidates session (e.g., password change)
 *
 * No Auto-Logout Timer:
 * - ❌ NO client-side countdown
 * - ✅ Backend controls expiry via JWT claims
 * - ✅ Client only reacts to backend responses
 *
 * ⚠️ Reminder: Tokens will move to httpOnly cookies during Sprint 6 security audit
 * for stronger XSS protection.
 */
