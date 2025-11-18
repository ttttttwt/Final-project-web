/**
 * Authentication Utilities
 *
 * 🔐 SECURITY NOTE:
 * Sprint 3 temporarily stores tokens in localStorage for implementation speed.
 * These helpers centralize token cleanup and validation before backend migration
 * to httpOnly cookies (planned for Sprint 6 security audit).
 */

import { authService } from "@/services/authService";
import { clearTokens, hasValidAccessToken } from "@/lib/tokenStorage";

/**
 * Clear user session (logout)
 *
 * 🔐 Calls backend logout endpoint (invalidates refresh tokens server-side)
 * and removes tokens from localStorage.
 *
 * @returns Promise that resolves when logout is complete
 */
export async function clearSession(): Promise<void> {
  try {
    if (hasValidAccessToken()) {
      await authService.logout();
    }
  } catch (error) {
    console.error("Failed to clear session:", error);
    // Don't throw - allow local cleanup even if backend fails
  } finally {
    clearTokens();
  }
}

/**
 * Check if user has an active session
 *
 * 🔐 Checks local token presence before calling backend for validation.
 * The backend remains the source of truth for authentication state.
 *
 * @returns Promise<boolean> - true if session is valid
 */
export async function hasActiveSession(): Promise<boolean> {
  if (!hasValidAccessToken()) {
    return false;
  }
  try {
    await authService.getProfile();
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

/**
 * Redirect to login page
 *
 * Helper function to redirect unauthenticated users to login.
 * Only works in browser context.
 *
 * @param returnUrl - Optional URL to return to after login
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const url = new URL("/login", window.location.origin);

  // Avoid nesting returnUrl pointing to /login
  const safeReturn =
    returnUrl && !returnUrl.startsWith("/login") ? returnUrl : undefined;

  if (safeReturn) {
    url.searchParams.set("returnUrl", safeReturn);
  }

  // Use replace to avoid stacking history entries and loops
  if (currentPath === "/login") {
    window.history.replaceState(null, "", url.toString());
  } else {
    window.location.replace(url.toString());
  }
}

/**
 * Redirect to dashboard
 *
 * Helper function to redirect authenticated users to dashboard.
 * Only works in browser context.
 */
export function redirectToDashboard(): void {
  if (typeof window === "undefined") return;
  window.location.href = "/dashboard";
}

/**
 * Handle authentication error
 *
 * Centralized error handling for authentication failures.
 * Determines if user should be redirected to login.
 *
 * @param error - Error object
 * @returns boolean - true if handled (redirected), false otherwise
 */
export function handleAuthError(error: unknown): boolean {
  const status = (error as { response?: { status?: number } })?.response
    ?.status;

  if (status === 401 || status === 403) {
    clearTokens();
    redirectToLogin(window.location.pathname);
    return true;
  }

  return false;
}

/**
 * 🔐 SECURITY NOTES:
 *
 * Token Flow (Temporary Sprint 3 Strategy):
 * 1. Login → Backend returns access + refresh tokens in response body
 * 2. Client stores tokens in localStorage (Authorization header added manually)
 * 3. Refresh → Axios interceptor posts refresh token to /auth/refresh
 * 4. Logout → Backend revokes refresh tokens, client clears localStorage
 *
 * ⚠️ This approach is temporary and will be replaced with httpOnly cookies
 * during the Sprint 6 security audit for stronger XSS protection.
 */
