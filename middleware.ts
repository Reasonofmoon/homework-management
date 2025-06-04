import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createMiddlewareClient({ req, res })

    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Protected routes
    const protectedRoutes = ["/dashboard", "/settings"]
    const authRoutes = ["/auth/login", "/auth/signup"]

    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL("/auth/login", req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes with session
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
}
