import { NextRequest, NextResponse } from "next/server";

// Public routes that do NOT require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password"] as const;

function isPublicRoute(pathname: string): boolean {
  // Exact matches for top-level public paths
  if (PUBLIC_ROUTES.includes(pathname as (typeof PUBLIC_ROUTES)[number]))
    return true;

  // Allow static/public assets (extra safety; main filter is via matcher)
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/public/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return true;
  }

  return false;
}

// Resolve backend API base URL from environment
const API_BASE = process.env.NEXT_PUBLIC_API_URL; // e.g., http://localhost:8088/api/v1

/**
 * Next.js Middleware - Server-side route protection
 *
 * Strategy:
 * - Skip public routes
 * - For protected routes, call backend to validate httpOnly cookie
 * - Redirect unauthenticated users to /login with returnUrl
 *
 * Notes:
 * - We forward the incoming Cookie header so backend can validate session
 * - We DO NOT attempt to read/parse JWTs in middleware
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow public routes without checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // If API base not configured, fail-open to avoid blocking local dev
  if (!API_BASE) {
    return NextResponse.next();
  }

  // Validate session by calling backend (uses httpOnly cookies on server)
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "GET",
      // Forward cookies so backend can validate the session
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        // Pass through UA for observability (optional)
        "user-agent": request.headers.get("user-agent") ?? "",
      },
      // Never cache auth checks
      cache: "no-store",
      // Keep connection lightweight for edge
      // credentials can't be used cross-origin here; cookie header is forwarded instead
    });

    if (res.ok) {
      // Authenticated - allow request to continue
      return NextResponse.next();
    }
  } catch {
    // Network/backend error: treat as unauthenticated for protected routes
  }

  // Not authenticated → redirect to login with returnUrl
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  const returnUrl = pathname + (search || "");
  loginUrl.searchParams.set("returnUrl", returnUrl);

  // Prevent redirect loop safeguard (shouldn't trigger due to public route check)
  if (pathname !== "/login") {
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply to all routes except assets and API routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
