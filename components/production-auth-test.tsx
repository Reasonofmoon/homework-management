"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"

export default function ProductionAuthTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testEmail, setTestEmail] = useState("soundfury37@gmail.com")
  const [testPassword, setTestPassword] = useState("")

  const runProductionTest = async () => {
    setIsLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabase: {},
      auth: {},
      domains: {},
    }

    try {
      // 1. 환경 정보 수집
      results.environment = {
        url: window.location.href,
        origin: window.location.origin,
        hostname: window.location.hostname,
        isProduction: process.env.NODE_ENV === "production",
        isVercel: window.location.hostname.includes("vercel.app"),
        userAgent: navigator.userAgent.substring(0, 100),
      }

      // 2. 환경 변수 확인
      results.supabase = {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + "...",
        keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      }

      // 3. Supabase 연결 테스트
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        )

        // 기본 연결 테스트
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        results.supabase.connectionTest = {
          success: !sessionError,
          error: sessionError?.message,
          hasSession: !!sessionData.session,
        }

        // 사용자 존재 확인 (이메일로)
        if (testEmail) {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password: "dummy-password-for-test", // 실제 비밀번호가 아닌 더미
            })

            results.auth.userExists = !signInError?.message?.includes("Invalid login credentials")
            results.auth.signInError = signInError?.message
          } catch (e: any) {
            results.auth.testError = e.message
          }
        }
      } catch (supabaseError: any) {
        results.supabase.initError = supabaseError.message
      }

      // 4. 도메인 및 CORS 확인
      results.domains = {
        currentDomain: window.location.hostname,
        isCustomDomain: !window.location.hostname.includes("vercel.app"),
        protocol: window.location.protocol,
        port: window.location.port,
      }

      setTestResults(results)
    } catch (error: any) {
      setTestResults({
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testActualLogin = async () => {
    if (!testEmail || !testPassword) {
      alert("이메일과 비밀번호를 입력해주세요.")
      return
    }

    setIsLoading(true)
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      )

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        alert(`로그인 실패: ${error.message}`)
      } else {
        alert("로그인 성공!")
        console.log("로그인 데이터:", data)
      }
    } catch (error: any) {
      alert(`오류: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runProductionTest()
  }, [])

  const getStatusIcon = (condition: boolean | undefined) => {
    if (condition === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            프로덕션 환경 인증 테스트
          </CardTitle>
          <CardDescription>
            배포된 환경에서 실제 인증 기능을 테스트합니다.
            <br />
            현재 도메인: <strong>{typeof window !== "undefined" ? window.location.hostname : "로딩 중..."}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={runProductionTest} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "테스트 중..." : "테스트 다시 실행"}
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://supabase.com/dashboard/project/gvtegncddn/auth/users"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase 대시보드
              </a>
            </Button>
          </div>

          {testResults && !testResults.error && (
            <div className="space-y-6">
              {/* 환경 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">환경 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span>도메인:</span>
                    <Badge variant="outline">{testResults.environment.hostname}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>프로토콜:</span>
                    <Badge variant={testResults.domains.protocol === "https:" ? "default" : "destructive"}>
                      {testResults.domains.protocol}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Vercel 배포:</span>
                    <Badge variant={testResults.environment.isVercel ? "default" : "secondary"}>
                      {testResults.environment.isVercel ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>프로덕션:</span>
                    <Badge variant={testResults.environment.isProduction ? "default" : "secondary"}>
                      {testResults.environment.isProduction ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Supabase 설정 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Supabase 설정</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.supabase.hasUrl)}
                    <span>SUPABASE_URL:</span>
                    <Badge variant={testResults.supabase.hasUrl ? "default" : "destructive"}>
                      {testResults.supabase.hasUrl ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.supabase.hasKey)}
                    <span>SUPABASE_ANON_KEY:</span>
                    <Badge variant={testResults.supabase.hasKey ? "default" : "destructive"}>
                      {testResults.supabase.hasKey ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                  {testResults.supabase.connectionTest && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(testResults.supabase.connectionTest.success)}
                      <span>Supabase 연결:</span>
                      <Badge variant={testResults.supabase.connectionTest.success ? "default" : "destructive"}>
                        {testResults.supabase.connectionTest.success ? "성공" : "실패"}
                      </Badge>
                    </div>
                  )}
                </div>

                {testResults.supabase.connectionTest?.error && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>연결 오류: {testResults.supabase.connectionTest.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 실제 로그인 테스트 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">실제 로그인 테스트</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="test-email">테스트 이메일</Label>
                      <Input
                        id="test-email"
                        type="email"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="soundfury37@gmail.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="test-password">비밀번호</Label>
                      <Input
                        id="test-password"
                        type="password"
                        value={testPassword}
                        onChange={(e) => setTestPassword(e.target.value)}
                        placeholder="실제 비밀번호 입력"
                      />
                    </div>
                  </div>
                  <Button onClick={testActualLogin} disabled={isLoading || !testEmail || !testPassword}>
                    실제 로그인 테스트
                  </Button>
                </div>
              </div>

              {/* 해결 방법 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">문제 해결 가이드</h3>
                <div className="space-y-3">
                  {!testResults.supabase.hasUrl && (
                    <Alert>
                      <AlertDescription>
                        <strong>1. Vercel 환경 변수 설정</strong>
                        <br />
                        Vercel Dashboard → Settings → Environment Variables에서 NEXT_PUBLIC_SUPABASE_URL 추가
                      </AlertDescription>
                    </Alert>
                  )}

                  {!testResults.supabase.hasKey && (
                    <Alert>
                      <AlertDescription>
                        <strong>2. Supabase API 키 설정</strong>
                        <br />
                        Vercel Dashboard → Settings → Environment Variables에서 NEXT_PUBLIC_SUPABASE_ANON_KEY 추가
                      </AlertDescription>
                    </Alert>
                  )}

                  <Alert>
                    <AlertDescription>
                      <strong>3. Supabase 도메인 설정 확인</strong>
                      <br />
                      Supabase Dashboard → Authentication → URL Configuration에서:
                      <br />
                      Site URL: <code>https://{testResults.environment.hostname}</code>
                      <br />
                      Redirect URLs: <code>https://{testResults.environment.hostname}/**</code>
                    </AlertDescription>
                  </Alert>

                  <Alert>
                    <AlertDescription>
                      <strong>4. 사용자 계정 확인</strong>
                      <br />
                      Supabase Dashboard → Authentication → Users에서 soundfury37@gmail.com 계정이 존재하고 이메일이
                      확인되었는지 체크
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          )}

          {testResults?.error && (
            <Alert variant="destructive">
              <AlertDescription>테스트 실행 중 오류가 발생했습니다: {testResults.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
