import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { hasActiveSession, redirectToLogin } from "@/lib/auth";

/**
 * Authentication Hook
 *
 * 🔐 Provides session management and authentication state.
 * Uses httpOnly cookies for token storage (NO client-side token handling).
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
   * 🔐 Calls backend to validate httpOnly cookie.
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
   * 🔐 Calls backend to validate httpOnly cookie.
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
 * 🔐 SECURITY NOTES:
 *
 * Session Management:
 * - ✅ Backend validates httpOnly cookie on every protected API call
 * - ✅ loadUser() calls backend to verify session (NOT local token check)
 * - ✅ checkSession() always queries backend (source of truth)
 * - ✅ No client-side token expiry checks (backend handles this)
 *
 * Why No Client-Side Token Validation?
 * - httpOnly cookies cannot be read by JavaScript (XSS protection)
 * - Only backend can validate token signatures
 * - Client state can be tampered with
 * - Backend is single source of truth
 *
 * Token Refresh:
 * - ✅ Handled automatically by axios interceptor (lib/api.ts)
 * - ✅ On 401 response, interceptor calls refresh endpoint
 * - ✅ Backend uses httpOnly refresh cookie to issue new access token
 * - ✅ Promise lock prevents concurrent refresh requests
 * - ✅ If refresh fails, user is logged out
 *
 * Auto-Logout Scenarios:
 * 1. Token refresh fails (401 → refresh → 401)
 * 2. User calls logout() action
 * 3. Backend invalidates session (e.g., password change)
 *
 * No Auto-Logout Timer:
 * - ❌ NO client-side token expiry timer
 * - ❌ NO automatic logout after X minutes
 * - ✅ Backend handles token expiry and validation
 * - ✅ Client only reacts to backend responses
 */
