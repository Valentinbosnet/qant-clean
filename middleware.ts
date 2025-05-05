import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define which paths require authentication
const authRequiredPaths = [
  "/dashboard",
  "/portfolio",
  "/transactions",
  "/predictions",
  "/settings",
  "/real-time-predictions",
  "/progressive-analysis",
  "/api-status",
]

// Define which paths should be accessible only with a subscription
const subscriptionRequiredPaths = ["/real-time-predictions", "/progressive-analysis"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const isAuthRequired = authRequiredPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  // Check if the path requires a subscription
  const isSubscriptionRequired = subscriptionRequiredPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )

  // Get authentication cookies
  const hasSession = request.cookies.has("app-session") || request.cookies.has("next-auth.session-token")

  // Get subscription cookie
  const hasSubscription = request.cookies.has("has-subscription")

  // If authentication is required but user is not authenticated
  if (isAuthRequired && !hasSession) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(url)
  }

  // If subscription is required but user doesn't have one
  if (isSubscriptionRequired && !hasSubscription) {
    return NextResponse.redirect(new URL("/pricing", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - api routes that don't require auth
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth|api/register|api/verify-email|api/debug).*)",
  ],
}
