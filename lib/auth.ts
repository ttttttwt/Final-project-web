/**
 * Authentication Utilities
 *
 * 🔐 SECURITY NOTE:
 * This file contains MINIMAL auth utilities.
 * NO token storage, validation, or management.
 * All tokens are stored in httpOnly cookies (set/read by backend).
 *
 * Why httpOnly cookies?
 * - ✅ XSS Protection: JavaScript cannot access cookies
 * - ✅ CSRF Protection: SameSite=Strict prevents cross-site requests
 * - ✅ Secure: Transmitted only over HTTPS
 * - ✅ OWASP Compliant: Follows security best practices
 */

import { authService } from "@/services/authService";

/**
 * Clear user session (logout)
 *
 * 🔐 This calls the backend logout endpoint to clear httpOnly cookies.
 * The backend is responsible for invalidating tokens server-side.
 *
 * @returns Promise that resolves when logout is complete
 */
export async function clearSession(): Promise<void> {
  try {
    // Call backend to clear httpOnly cookies
    await authService.logout();
  } catch (error) {
    console.error("Failed to clear session:", error);
    // Don't throw - allow local cleanup even if backend fails
  }
}

/**
 * Check if user has an active session
 *
 * 🔐 This calls the backend to validate the httpOnly cookie.
 * The backend is the source of truth for session validity.
 *
 * @returns Promise<boolean> - true if session is valid
 */
export async function hasActiveSession(): Promise<boolean> {
  try {
    await authService.getProfile();
    return true;
  } catch {
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
    redirectToLogin(window.location.pathname);
    return true;
  }

  return false;
}

/**
 * 🔐 SECURITY NOTES:
 *
 * What this file does NOT do:
 * ❌ Store tokens (localStorage, sessionStorage, state)
 * ❌ Validate tokens client-side
 * ❌ Decode JWT tokens
 * ❌ Check token expiry
 * ❌ Manage token lifecycle
 *
 * Why?
 * - All token operations are handled by backend via httpOnly cookies
 * - Client only calls APIs, never manages tokens directly
 * - Backend is single source of truth for authentication state
 *
 * Token Flow:
 * 1. Login → Backend sets httpOnly cookies via Set-Cookie header
 * 2. API calls → Browser sends cookies automatically (withCredentials: true)
 * 3. Token refresh → Backend reads refresh cookie, sets new access cookie
 * 4. Logout → Backend clears httpOnly cookies
 *
 * OWASP Compliance:
 * - A3:2021 – Injection: No token handling in client prevents token injection
 * - A5:2021 – Security Misconfiguration: httpOnly + Secure + SameSite flags
 * - A7:2021 – Identification and Authentication Failures: Server-side validation
 * - A8:2021 – Software and Data Integrity Failures: No client-side token tampering
 */
