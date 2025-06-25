import { type NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  // Protected routes
  const protectedRoutes = ["/dashboard", "/checkout", "/admin"]
  const adminRoutes = ["/admin"]

  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/auth"
  ) {
    return NextResponse.next()
  }

  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("token")?.value

    if (!token) {
      const loginUrl = new URL("/auth", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // For now, just check if token exists - we'll validate in API routes
      if (isAdminRoute) {
        // Admin check will be done in API routes
      }

      return NextResponse.next()
    } catch (error) {
      const loginUrl = new URL("/auth", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
