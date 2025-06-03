"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdvancedConnectionTest } from "@/components/advanced-connection-test"

const SettingsPage = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runAdvancedDiagnostics = async () => {
    setIsLoading(true)
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        environment: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          currentDomain: window.location.hostname,
          fullUrl: window.location.href,
          userAgent: navigator.userAgent,
          isProduction: process.env.NODE_ENV === "production",
        },
        supabase: {},
        network: {},
        auth: {},
      }

      // 환경 변수 상세 확인
      if (results.environment.hasUrl) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        results.environment.urlDetails = {
          length: url.length,
          startsWithHttps: url.startsWith("https://"),
          containsSupabase: url.includes("supabase"),
          domain: url.split("//")[1]?.split(".")[0] || "unknown",
        }
      }

      // 네트워크 연결 테스트
      try {
        const networkTest = await fetch("https://httpbin.org/get", {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        })
        results.network.externalConnection = networkTest.ok
        results.network.externalStatus = networkTest.status
      } catch (e: any) {
        results.network.externalConnection = false
        results.network.externalError = e.message
      }

      // Supabase 도메인 직접 테스트
      if (results.environment.hasUrl) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        try {
          const domainTest = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: "GET",
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            },
            signal: AbortSignal.timeout(10000),
          })
          results.supabase.domainReachable = domainTest.ok
          results.supabase.domainStatus = domainTest.status
          results.supabase.domainResponse = await domainTest.text()
        } catch (e: any) {
          results.supabase.domainReachable = false
          results.supabase.domainError = e.message
        }
      }

      // Supabase Auth 테스트
      if (results.environment.hasUrl && results.environment.hasKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js")
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
              },
            },
          )

          // 세션 확인
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          results.auth.sessionCheck = {
            success: !sessionError,
            error: sessionError?.message,
            hasSession: !!sessionData.session,
          }

          // 사용자 확인 (실제 로그인 시도 없이)
          const { data: userData, error: userError } = await supabase.auth.getUser()
          results.auth.userCheck = {
            success: !userError,
            error: userError?.message,
            hasUser: !!userData.user,
          }
        } catch (e: any) {
          results.auth.clientError = e.message
        }
      }

      setDiagnostics(results)
    } catch (error: any) {
      setDiagnostics({ error: error.message, timestamp: new Date().toISOString() })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (condition: boolean | undefined) => {
    if (condition === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-5">Settings</h1>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Card Title 1</CardTitle>
            <CardDescription>Card Description 1</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Title 2</CardTitle>
            <CardDescription>Card Description 2</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content 2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Title 3</CardTitle>
            <CardDescription>Card Description 3</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content 3</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              고급 연결 진단
            </CardTitle>
            <CardDescription>Connection timeout 문제를 상세히 분석합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAdvancedDiagnostics} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  상세 진단 중...
                </>
              ) : (
                "상세 진단 실행"
              )}
            </Button>

            {diagnostics && !diagnostics.error && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2">환경 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostics.environment.hasUrl)}
                        <span>Supabase URL: {diagnostics.environment.hasUrl ? "설정됨" : "누락"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostics.environment.hasKey)}
                        <span>API Key: {diagnostics.environment.hasKey ? "설정됨" : "누락"}</span>
                      </div>
                      {diagnostics.environment.urlDetails && (
                        <div className="ml-6 text-xs text-muted-foreground">
                          <div>길이: {diagnostics.environment.urlDetails.length}자</div>
                          <div>HTTPS: {diagnostics.environment.urlDetails.startsWithHttps ? "✓" : "✗"}</div>
                          <div>도메인: {diagnostics.environment.urlDetails.domain}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">네트워크 연결</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostics.network.externalConnection)}
                        <span>외부 연결: {diagnostics.network.externalConnection ? "정상" : "실패"}</span>
                      </div>
                      {diagnostics.network.externalError && (
                        <div className="ml-6 text-xs text-red-500">{diagnostics.network.externalError}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Supabase 도메인 테스트</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.supabase.domainReachable)}
                      <span>도메인 접근: {diagnostics.supabase.domainReachable ? "성공" : "실패"}</span>
                      {diagnostics.supabase.domainStatus && (
                        <Badge variant="outline">HTTP {diagnostics.supabase.domainStatus}</Badge>
                      )}
                    </div>
                    {diagnostics.supabase.domainError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>도메인 연결 오류:</strong> {diagnostics.supabase.domainError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">인증 시스템 테스트</h4>
                  <div className="space-y-2 text-sm">
                    {diagnostics.auth.sessionCheck && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostics.auth.sessionCheck.success)}
                        <span>세션 확인: {diagnostics.auth.sessionCheck.success ? "성공" : "실패"}</span>
                      </div>
                    )}
                    {diagnostics.auth.userCheck && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(diagnostics.auth.userCheck.success)}
                        <span>사용자 확인: {diagnostics.auth.userCheck.success ? "성공" : "실패"}</span>
                      </div>
                    )}
                    {diagnostics.auth.clientError && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>클라이언트 오류:</strong> {diagnostics.auth.clientError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">해결 방법</h4>
                  <div className="space-y-2">
                    {!diagnostics.network.externalConnection && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>네트워크 문제:</strong> 인터넷 연결을 확인하거나 방화벽 설정을 점검하세요.
                        </AlertDescription>
                      </Alert>
                    )}

                    {!diagnostics.supabase.domainReachable && diagnostics.network.externalConnection && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          <strong>Supabase 도메인 문제:</strong>
                          <br />
                          1. 환경 변수의 URL이 올바른지 확인
                          <br />
                          2. Supabase 프로젝트가 활성화되어 있는지 확인
                          <br />
                          3. API 키가 유효한지 확인
                        </AlertDescription>
                      </Alert>
                    )}

                    <Alert>
                      <AlertDescription>
                        <strong>추가 확인사항:</strong>
                        <br />• 브라우저 개발자 도구 → Network 탭에서 실패하는 요청 확인
                        <br />• Supabase 대시보드에서 프로젝트 상태 확인
                        <br />• 다른 브라우저나 시크릿 모드에서 테스트
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com/dashboard/project/gvtegncddn" target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase 대시보드
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/gvtegncddn/settings/api"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API 설정 확인
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    페이지 새로고침
                  </Button>
                </div>
              </div>
            )}

            {diagnostics?.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>진단 실행 중 오류:</strong> {diagnostics.error}
                  <br />
                  <small>시간: {diagnostics.timestamp}</small>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <AdvancedConnectionTest />
      </div>
    </div>
  )
}

export default SettingsPage
