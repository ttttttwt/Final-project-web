"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * AuthProvider Component
 *
 * 🔐 Initializes user session on app mount.
 * This component runs on the client side and loads the user session
 * by validating the httpOnly cookie via the backend.
 *
 * Flow:
 * 1. Component mounts
 * 2. Calls loadUser() which queries backend /users/profile
 * 3. Backend validates httpOnly cookie
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  /**
   * Initialize user session on mount
   *
   * 🔐 This calls the backend to validate the httpOnly cookie.
   * If the cookie is valid, user data is loaded into the store.
   * If the cookie is invalid/expired, user remains unauthenticated.
   *
   * Note: Only runs once on mount, not on every render.
   */
  useEffect(() => {
    // Only load user if not already authenticated and not currently loading
    if (!isAuthenticated && !isLoading) {
      loadUser();
    }
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
 * Session Initialization:
 * - ✅ Runs client-side only ("use client" directive)
 * - ✅ Calls backend to validate httpOnly cookie
 * - ✅ Does NOT read or validate cookies client-side
 * - ✅ Backend is source of truth for authentication
 *
 * Why not block rendering?
 * - ❌ Blocking would show blank screen during load (bad UX)
 * - ✅ Public pages should render immediately
 * - ✅ Protected pages handle their own loading states
 * - ✅ Middleware also protects routes server-side
 *
 * Session Persistence:
 * - ✅ Page refresh maintains session (if cookie valid)
 * - ✅ Multiple tabs share session (same cookie)
 * - ✅ Session expires when backend invalidates cookie
 *
 * Auto-Logout Scenarios:
 * 1. Token refresh fails (401 → refresh → 401) → Axios interceptor handles
 * 2. User calls logout() → Backend clears cookie
 * 3. Cookie expires → Backend returns 401 → Triggers refresh or logout
 *
 * No Expiry Timer:
 * - ❌ NO client-side countdown to logout
 * - ❌ NO automatic logout after X minutes client-side
 * - ✅ Backend controls token expiry
 * - ✅ Client only reacts to 401 responses
 */
