"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [detailedError, setDetailedError] = useState<string>("")
  const [isDebugging, setIsDebugging] = useState(false)

  const { signIn, error } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDetailedError("")

    try {
      console.log("로그인 시도:", { email, passwordLength: password.length })

      const result = await signIn(email, password)
      console.log("로그인 결과:", result)

      if (result.success) {
        console.log("로그인 성공, 대시보드로 이동")
        // Use window.location for more reliable redirect
        window.location.href = "/dashboard"
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="text-xs bg-gray-100 p-2 rounded">
                <div>이메일: {email}</div>
                <div>비밀번호 길이: {password.length}</div>
                <div>환경: {process.env.NODE_ENV}</div>
              </div>
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
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              disabled={isLoading || !email || !password}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              로그인
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">계정이 없으신가요? </span>
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                회원가입
              </Link>
            </div>
          </CardFooter>
        </form>
      </div>
    </div>
  )
}
