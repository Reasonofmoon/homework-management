"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Copy } from "lucide-react"

export default function DeploymentDebug() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      // Environment checks
      const envCheck = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      }

      // Runtime environment
      const runtimeInfo = {
        isProduction: process.env.NODE_ENV === "production",
        isDevelopment: process.env.NODE_ENV === "development",
        currentUrl: typeof window !== "undefined" ? window.location.href : "서버 사이드",
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "서버 사이드",
        isVercel: process.env.VERCEL === "1",
        vercelUrl: process.env.VERCEL_URL,
        vercelEnv: process.env.VERCEL_ENV,
      }

      // Supabase connection test
      let connectionTest = null
      try {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || "",
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        )

        const { data, error } = await supabase.auth.getSession()
        connectionTest = {
          success: !error,
          error: error?.message,
          hasSession: !!data.session,
        }
      } catch (error: any) {
        connectionTest = {
          success: false,
          error: error.message,
          hasSession: false,
        }
      }

      setDiagnostics({
        environment: envCheck,
        runtime: runtimeInfo,
        connection: connectionTest,
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error("진단 실행 중 오류:", error)
      setDiagnostics({
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (condition: boolean) => {
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            배포 환경 진단
          </CardTitle>
          <CardDescription>Vercel 개발 환경과 배포 환경 간의 차이점을 분석합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={isLoading} className="mb-4">
            {isLoading ? "진단 중..." : "진단 다시 실행"}
          </Button>

          {diagnostics && (
            <div className="space-y-6">
              {/* 환경 변수 체크 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">환경 변수 상태</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.environment.hasUrl)}
                    <span>NEXT_PUBLIC_SUPABASE_URL</span>
                    <Badge variant={diagnostics.environment.hasUrl ? "default" : "destructive"}>
                      {diagnostics.environment.hasUrl ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.environment.hasKey)}
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    <Badge variant={diagnostics.environment.hasKey ? "default" : "destructive"}>
                      {diagnostics.environment.hasKey ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                </div>

                {diagnostics.environment.hasUrl && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Supabase URL:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(diagnostics.environment.supabaseUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <code className="text-xs break-all">{diagnostics.environment.supabaseUrl}</code>
                  </div>
                )}
              </div>

              {/* 런타임 정보 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">런타임 환경</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span>환경:</span>
                    <Badge variant={diagnostics.runtime.isProduction ? "default" : "secondary"}>
                      {diagnostics.runtime.isProduction ? "Production" : "Development"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Vercel:</span>
                    <Badge variant={diagnostics.runtime.isVercel ? "default" : "secondary"}>
                      {diagnostics.runtime.isVercel ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {diagnostics.runtime.vercelEnv && (
                    <div className="flex items-center gap-2">
                      <span>Vercel 환경:</span>
                      <Badge>{diagnostics.runtime.vercelEnv}</Badge>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium mb-2">현재 URL:</div>
                  <code className="text-xs break-all">{diagnostics.runtime.currentUrl}</code>
                </div>
              </div>

              {/* 연결 테스트 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Supabase 연결 상태</h3>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(diagnostics.connection.success)}
                  <span>연결 상태:</span>
                  <Badge variant={diagnostics.connection.success ? "default" : "destructive"}>
                    {diagnostics.connection.success ? "성공" : "실패"}
                  </Badge>
                </div>

                {diagnostics.connection.error && (
                  <Alert variant="destructive">
                    <AlertDescription>연결 오류: {diagnostics.connection.error}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 해결 방법 제안 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">해결 방법</h3>
                <div className="space-y-3">
                  {!diagnostics.environment.hasUrl && (
                    <Alert>
                      <AlertDescription>
                        <strong>NEXT_PUBLIC_SUPABASE_URL이 누락되었습니다.</strong>
                        <br />
                        Vercel 대시보드에서 환경 변수를 설정하고 재배포하세요.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!diagnostics.environment.hasKey && (
                    <Alert>
                      <AlertDescription>
                        <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY가 누락되었습니다.</strong>
                        <br />
                        Vercel 대시보드에서 환경 변수를 설정하고 재배포하세요.
                      </AlertDescription>
                    </Alert>
                  )}

                  {diagnostics.environment.hasUrl &&
                    diagnostics.environment.hasKey &&
                    !diagnostics.connection.success && (
                      <Alert>
                        <AlertDescription>
                          <strong>Supabase 연결에 실패했습니다.</strong>
                          <br />
                          1. Supabase 프로젝트가 활성화되어 있는지 확인하세요.
                          <br />
                          2. API 키가 올바른지 확인하세요.
                          <br />
                          3. Supabase 대시보드에서 허용된 도메인을 확인하세요.
                        </AlertDescription>
                      </Alert>
                    )}

                  {diagnostics.runtime.isProduction && (
                    <Alert>
                      <AlertDescription>
                        <strong>프로덕션 환경 체크리스트:</strong>
                        <br />
                        1. Vercel 환경 변수가 모든 환경(Production, Preview, Development)에 설정되어 있는지 확인
                        <br />
                        2. Supabase 대시보드 → Authentication → URL Configuration에서 Site URL과 Redirect URLs 확인
                        <br />
                        3. 배포 후 브라우저 캐시 클리어
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
