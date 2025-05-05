import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define public paths that don't require authentication
const publicPaths = [
  "/login",
  "/register",
  "/api/auth",
  "/verify-email",
  "/pricing",
  "/api/stripe",
  "/api/dev",
  "/favicon.ico",
  "/debug",
  "/api/debug",
]

// Check if a path is public
function isPublicPath(path: string): boolean {
  return publicPaths.some((publicPath) => path.startsWith(publicPath))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  // Allow access to public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Check if user is authenticated
  const hasSession = request.cookies.has("app-session") || request.cookies.has("next-auth.session-token")

  // If not authenticated, redirect to login
  if (!hasSession) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure middleware to run on all routes except NextAuth API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|api/auth/\\[...nextauth\\]).*)"],
}
