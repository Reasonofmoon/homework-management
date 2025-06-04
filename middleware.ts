import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log("Middleware - 현재 경로:", req.nextUrl.pathname)
    console.log("Middleware - 세션 상태:", session ? "로그인됨" : "로그아웃됨")

    // Protected routes
    const protectedRoutes = ["/dashboard", "/settings"]
    const authRoutes = ["/auth/login", "/auth/signup"]

    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      console.log("Middleware - 보호된 경로 접근, 로그인 페이지로 리다이렉트")
      const redirectUrl = new URL("/auth/login", req.url)
      redirectUrl.searchParams.set("redirectTo", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect to dashboard if accessing auth routes with session
    if (isAuthRoute && session) {
      console.log("Middleware - 로그인된 상태에서 인증 페이지 접근, 대시보드로 리다이렉트")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Redirect root to appropriate page
    if (req.nextUrl.pathname === "/") {
      if (session) {
        console.log("Middleware - 루트 접근, 대시보드로 리다이렉트")
        return NextResponse.redirect(new URL("/dashboard", req.url))
      } else {
        console.log("Middleware - 루트 접근, 로그인 페이지로 리다이렉트")
        return NextResponse.redirect(new URL("/auth/login", req.url))
      }
    }

    return res
  } catch (error) {
    console.error("Middleware 오류:", error)
    // 오류 발생 시 그대로 진행
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
