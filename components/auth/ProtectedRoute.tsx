"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { redirectToLogin } from "@/lib/auth";

/**
 * ProtectedRoute Component
 *
 * 🔐 Client-side route protection wrapper.
 * Use this to protect individual pages/components from unauthenticated access.
 *
 * Features:
 * - Shows loading state while checking authentication
 * - Redirects to login if not authenticated
 * - Preserves current URL for return after login
 *
 * Note: This is CLIENT-SIDE protection only.
 * Server-side middleware is temporarily fail-open while tokens live in
 * localStorage (Sprint 3 strategy). Backend APIs still enforce auth.
 *
 * @example
 * ```tsx
 * // In a page component
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <Dashboard />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  /**
   * Redirect to login if not authenticated
   *
   * 🔐 Only redirects after loading is complete.
   * This prevents false redirects during session initialization.
   */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Get current path for return URL
      const currentPath = window.location.pathname + window.location.search;
      redirectToLogin(currentPath);
    }
  }, [isLoading, isAuthenticated]);

  /**
   * Show loading state
   *
   * Display centered spinner while checking authentication.
   * This provides better UX than showing protected content then redirecting.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Loading your session...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Show nothing while redirecting
   *
   * If not authenticated, show nothing while redirect happens.
   * This prevents flashing protected content.
   */
  if (!isAuthenticated) {
    return null;
  }

  /**
   * Render protected content
   *
   * User is authenticated, render the children.
   */
  return <>{children}</>;
}

/**
 * 🔐 SECURITY NOTES:
 *
 * Client-Side Protection:
 * - ✅ Prevents rendering protected UI before authentication
 * - ✅ Shows loading state during session check
 * - ✅ Redirects with return URL preservation
 * - ⚠️ NOT a security boundary (can be bypassed in browser)
 *
 * Why Client-Side Protection?
 * - Better UX: Loading states and smooth transitions
 * - Prevents flashing unauthenticated content
 * - Handles component-level protection
 *
 * Why NOT Security Boundary?
 * - Client code can be modified/bypassed
 * - Real security must be server-side (middleware + API)
 * - This is UX enhancement, not security feature
 *
 * Defense in Depth (Current Sprint 3 Reality):
 * 1. ⚠️ Next.js middleware disabled (localStorage tokens not accessible on edge)
 * 2. ✅ Backend API authentication (JWT validation via Authorization header)
 * 3. ✅ ProtectedRoute component (client-side UX guard)
 *
 * Middleware will be re-enabled once we migrate back to httpOnly cookies in
 * Sprint 6 (security audit).
 *
 * When to Use:
 * - ✅ Wrap entire page components
 * - ✅ Wrap sections of pages that need auth
 * - ✅ Show loading state during auth check
 *
 * When NOT to Use:
 * - ❌ As sole protection mechanism
 * - ❌ For API security (use backend validation)
 * - ❌ In place of middleware (use both)
 *
 * Loading State:
 * - Shows spinner while isLoading = true
 * - Only redirects after loading completes
 * - Prevents false redirects during initialization
 *
 * Return URL:
 * - Preserves current path + query params
 * - Allows redirect back after login
 * - Provides better user experience
 */
