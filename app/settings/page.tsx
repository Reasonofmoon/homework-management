"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PostConfigTest } from "@/components/post-config-test"

const SettingsPage = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    try {
      const results: any = {
        environment: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          currentDomain: window.location.hostname,
          isProduction: process.env.NODE_ENV === "production",
        },
        supabase: {},
        auth: {},
      }

      // Supabase 연결 테스트
      if (results.environment.hasUrl && results.environment.hasKey) {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

        const { data, error } = await supabase.auth.getSession()
        results.supabase.connectionSuccess = !error
        results.supabase.error = error?.message

        // 사용자 테스트
        try {
          const { error: authError } = await supabase.auth.signInWithPassword({
            email: "soundfury37@gmail.com",
            password: "test-password",
          })
          results.auth.userExists = !authError?.message?.includes("Invalid login credentials")
          results.auth.errorMessage = authError?.message
        } catch (e: any) {
          results.auth.testError = e.message
        }
      }

      setDiagnostics(results)
    } catch (error: any) {
      setDiagnostics({ error: error.message })
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              로그인 문제 진단
            </CardTitle>
            <CardDescription>배포 환경에서 로그인 문제를 진단합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDiagnostics} disabled={isLoading}>
              {isLoading ? "진단 중..." : "진단 실행"}
            </Button>

            {diagnostics && !diagnostics.error && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">환경 변수 상태</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.environment.hasUrl)}
                      <span>SUPABASE_URL:</span>
                      <Badge variant={diagnostics.environment.hasUrl ? "default" : "destructive"}>
                        {diagnostics.environment.hasUrl ? "설정됨" : "누락"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.environment.hasKey)}
                      <span>SUPABASE_KEY:</span>
                      <Badge variant={diagnostics.environment.hasKey ? "default" : "destructive"}>
                        {diagnostics.environment.hasKey ? "설정됨" : "누락"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Supabase 연결</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.supabase.connectionSuccess)}
                    <span>연결 상태:</span>
                    <Badge variant={diagnostics.supabase.connectionSuccess ? "default" : "destructive"}>
                      {diagnostics.supabase.connectionSuccess ? "성공" : "실패"}
                    </Badge>
                  </div>
                  {diagnostics.supabase.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{diagnostics.supabase.error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">사용자 계정</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(diagnostics.auth.userExists)}
                    <span>soundfury37@gmail.com:</span>
                    <Badge variant={diagnostics.auth.userExists ? "default" : "destructive"}>
                      {diagnostics.auth.userExists ? "계정 존재" : "계정 없음"}
                    </Badge>
                  </div>
                  {diagnostics.auth.errorMessage && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>{diagnostics.auth.errorMessage}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">해결 방법</h4>
                  <div className="space-y-2">
                    <Alert>
                      <AlertDescription>
                        <strong>1. Supabase 도메인 설정 확인</strong>
                        <br />
                        Site URL: https://{diagnostics.environment.currentDomain}
                        <br />
                        Redirect URLs: https://{diagnostics.environment.currentDomain}/**
                      </AlertDescription>
                    </Alert>

                    {diagnostics.auth.userExists === false && (
                      <Alert>
                        <AlertDescription>
                          <strong>2. 사용자 계정 생성</strong>
                          <br />
                          soundfury37@gmail.com 계정이 없습니다. 회원가입을 먼저 진행하세요.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/gvtegncddn/auth/url-configuration"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase URL 설정
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/gvtegncddn/auth/users"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase 사용자 관리
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/auth/signup">회원가입 페이지</a>
                  </Button>
                </div>
              </div>
            )}

            {diagnostics?.error && (
              <Alert variant="destructive">
                <AlertDescription>진단 실행 중 오류: {diagnostics.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <PostConfigTest />
      </div>
    </div>
  )
}

export default SettingsPage
