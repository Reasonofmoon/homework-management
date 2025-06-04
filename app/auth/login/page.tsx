"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

// LoginDebug 컴포넌트 정의
interface LoginDebugProps {
  email: string
  password: string
  user: any
  session: any
  redirectAttempts: number
}

function LoginDebug({ email, password, user, session, redirectAttempts }: LoginDebugProps) {
  return (
    <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-40">
      <h4 className="font-bold mb-1">디버그 정보:</h4>
      <div>이메일: {email}</div>
      <div>비밀번호 길이: {password.length}</div>
      <div>환경: {process.env.NODE_ENV}</div>
      <div>현재 경로: {typeof window !== "undefined" ? window.location.pathname : "unknown"}</div>
      <div>리다이렉트 시도: {redirectAttempts}회</div>

      <h4 className="font-bold mt-2 mb-1">사용자 정보:</h4>
      <div>로그인 상태: {user ? "로그인됨" : "로그인되지 않음"}</div>
      {user && (
        <>
          <div>사용자 ID: {user.id}</div>
          <div>이메일: {user.email}</div>
          <div>생성일: {new Date(user.created_at).toLocaleString()}</div>
        </>
      )}

      <h4 className="font-bold mt-2 mb-1">세션 정보:</h4>
      <div>세션 상태: {session ? "활성" : "비활성"}</div>
      {session && (
        <>
          <div>만료일: {new Date(session.expires_at * 1000).toLocaleString()}</div>
          <div>만료 여부: {Date.now() > session.expires_at * 1000 ? "만료됨" : "유효함"}</div>
        </>
      )}
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [detailedError, setDetailedError] = useState<string>("")
  const [isDebugging, setIsDebugging] = useState(false)
  const [redirectAttempts, setRedirectAttempts] = useState(0)

  const { signIn, error, user, session } = useAuth()
  const router = useRouter()

  // 이미 로그인된 사용자는 대시보드로 리다이렉트
  useEffect(() => {
    if (user && session) {
      console.log("사용자가 이미 로그인됨, 대시보드로 이동:", user.email)

      // 여러 방법으로 리다이렉트 시도
      const redirect = () => {
        try {
          // 방법 1: router.push
          router.push("/dashboard")

          // 방법 2: router.replace (뒤로가기 방지)
          setTimeout(() => {
            router.replace("/dashboard")
          }, 100)

          // 방법 3: window.location (강제 이동)
          setTimeout(() => {
            if (window.location.pathname === "/auth/login") {
              window.location.href = "/dashboard"
            }
          }, 500)
        } catch (error) {
          console.error("리다이렉트 오류:", error)
          // 최후의 수단: 페이지 새로고침
          window.location.reload()
        }
      }

      redirect()
      setRedirectAttempts((prev) => prev + 1)
    }
  }, [user, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDetailedError("")

    try {
      console.log("로그인 시도:", { email, passwordLength: password.length })

      const result = await signIn(email, password)
      console.log("로그인 결과:", result)

      if (result.success) {
        console.log("로그인 성공, 대시보드로 이동 시도")

        // 즉시 리다이렉트 시도
        router.push("/dashboard")

        // 백업 리다이렉트
        setTimeout(() => {
          if (window.location.pathname === "/auth/login") {
            console.log("첫 번째 리다이렉트 실패, 두 번째 시도")
            router.replace("/dashboard")
          }
        }, 1000)

        // 최종 백업
        setTimeout(() => {
          if (window.location.pathname === "/auth/login") {
            console.log("모든 리다이렉트 실패, 강제 이동")
            window.location.href = "/dashboard"
          }
        }, 2000)
      } else {
        console.error("로그인 실패:", result.error)
        setDetailedError(`로그인 실패: ${result.error?.message || "알 수 없는 오류"}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      setDetailedError(`예외 발생: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 강제 리다이렉트 버튼
  const forceRedirect = () => {
    console.log("강제 리다이렉트 실행")
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
          <CardDescription className="text-center">학생 숙제 관리 시스템에 로그인하세요</CardDescription>
        </CardHeader>

        {/* 로그인 상태 표시 */}
        {user && (
          <CardContent>
            <Alert>
              <AlertDescription>
                로그인됨: {user.email}
                {redirectAttempts > 0 && (
                  <div className="mt-2">
                    <p className="text-sm">리다이렉트 시도 중... ({redirectAttempts}회)</p>
                    <Button onClick={forceRedirect} size="sm" className="mt-2">
                      대시보드로 이동
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {(error || detailedError) && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error || detailedError}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setIsDebugging(!isDebugging)}
                    className="p-0 h-auto ml-2"
                  >
                    {isDebugging ? "디버그 숨기기" : "디버그 정보"}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {isDebugging && (
              <LoginDebug
                email={email}
                password={password}
                user={user}
                session={session}
                redirectAttempts={redirectAttempts}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || !!user}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !!user}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading || !!user}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            {!user ? (
              <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                로그인
              </Button>
            ) : (
              <Button type="button" onClick={forceRedirect} className="w-full">
                대시보드로 이동
              </Button>
            )}

            <div className="text-center text-sm">
              <span className="text-muted-foreground">계정이 없으신가요? </span>
              <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                회원가입
              </Link>
            </div>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
