"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthProvider Component
 *
 * 🔐 Initializes user session on app mount.
 * This component runs on the client side and loads the user session
 * by validating stored tokens (Authorization header) via the backend.
 *
 * Flow:
 * 1. Component mounts
 * 2. Calls loadUser() which queries backend /users/profile
 * 3. Backend validates Authorization header using stored tokens
 * 4. If valid: Updates authStore with user data
 * 5. If invalid: Sets isAuthenticated = false
 *
 * Why needed?
 * - User refreshes page → Session should persist
 * - User opens new tab → Session should be shared
 * - Token expires → Auto-logout via 401 handling
 *
 * @example
 * ```tsx
 * <RootLayout>
 *   <AuthProvider>
 *     {children}
 *   </AuthProvider>
 * </RootLayout>
 * ```
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser);

  /**
   * Initialize user session on mount
   *
   * 🔐 This calls the backend to validate the stored tokens (Authorization header).
   * If the cookie is valid, user data is loaded into the store.
   * If the cookie is invalid/expired, user remains unauthenticated.
   *
   * Note: Runs once on mount, not on every render.
   * We always call loadUser() to check session status.
   */
  useEffect(() => {
    // Avoid triggering profile loading on auth pages to prevent 401 loops
    try {
      const path = window.location?.pathname || "";
      const isAuthPage = ["/login", "/register", "/forgot-password"].some((p) =>
        path.startsWith(p)
      );
      if (isAuthPage) return;
    } catch {
      // If window is unavailable for any reason, continue normally
    }

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array = run once on mount

  /**
   * Render children immediately
   *
   * Note: We don't block rendering while loading the user.
   * Individual protected components/pages should handle loading states.
   * This allows public pages to render immediately while auth loads in background.
   */
  return <>{children}</>;
}

/**
 * 🔐 SECURITY NOTES:
 *
 * Session Initialization (Temporary Sprint 3 Strategy):
 * - ✅ Runs client-side only ("use client" directive)
 * - ✅ Calls backend to validate Authorization header (token from localStorage)
 * - ✅ Does NOT decode or validate JWTs client-side
 * - ✅ Backend remains source of truth for authentication
 *
 * Why not block rendering?
 * - ❌ Blocking would show blank screen during load (bad UX)
 * - ✅ Public pages should render immediately
 * - ✅ Protected pages handle their own loading states
 * - ✅ Middleware also protects routes server-side
 *
 * Session Persistence:
 * - ✅ Page refresh maintains session (tokens persist in localStorage)
 * - ✅ Multiple tabs share session (localStorage shared per origin)
 * - ✅ Session expires when backend invalidates token/refresh pair
 *
 * Auto-Logout Scenarios:
 * 1. Token refresh fails (401 → refresh → 401) → Axios interceptor handles
 * 2. User calls logout() → Backend revokes refresh token, client clears storage
 * 3. Token expires → Backend returns 401 → Triggers refresh or logout
 *
 * No Expiry Timer:
 * - ❌ NO client-side countdown to logout
 * - ❌ NO automatic logout after X minutes client-side
 * - ✅ Backend controls token expiry
 * - ✅ Client only reacts to 401 responses
 *
 * ⚠️ Reminder: Tokens move to httpOnly cookies during Sprint 6 security audit.
 */
