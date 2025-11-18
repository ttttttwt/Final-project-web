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

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow public routes without checks
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // ⚠️ Sprint 3 Token Strategy (localStorage)
  // Tokens only exist in browser localStorage, so middleware running on the
  // edge cannot read them. We therefore fail-open here and rely on
  // client-side guards + backend API authorization until Sprint 6 migrates
  // back to httpOnly cookies.
  if (!API_BASE) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Apply to all routes except assets and API routes
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
