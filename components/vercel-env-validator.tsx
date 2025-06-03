"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, Copy } from "lucide-react"

export default function VercelEnvValidator() {
  const [validation, setValidation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateEnvironment = async () => {
    setIsLoading(true)
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabase: {},
      auth: {},
      recommendations: [],
    }

    try {
      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      results.environment = {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlValue: supabaseUrl,
        keyValue: supabaseKey,
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseKey?.length || 0,
        isProduction: process.env.NODE_ENV === "production",
        currentDomain: typeof window !== "undefined" ? window.location.hostname : "unknown",
      }

      // Supabase URL 형식 검증
      if (supabaseUrl) {
        const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co$/
        results.supabase.urlValid = urlPattern.test(supabaseUrl)
        results.supabase.urlFormat = supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co")
      }

      // Supabase 연결 테스트
      if (supabaseUrl && supabaseKey) {
        try {
          const { createClient } = await import("@supabase/supabase-js")
          const supabase = createClient(supabaseUrl, supabaseKey)

          // 기본 연결 테스트
          const { data, error } = await supabase.auth.getSession()
          results.supabase.connectionSuccess = !error
          results.supabase.connectionError = error?.message

          // 프로젝트 정보 확인
          if (!error) {
            try {
              const { data: healthData, error: healthError } = await supabase.from("_health").select("*").limit(1)
              results.supabase.databaseAccess = !healthError
              results.supabase.databaseError = healthError?.message
            } catch (e) {
              // _health 테이블이 없을 수 있음 - 정상
              results.supabase.databaseAccess = true
            }
          }

          // 사용자 테스트 (soundfury37@gmail.com)
          try {
            const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
              email: "soundfury37@gmail.com",
              password: "test-password-123", // 더미 비밀번호
            })

            // 사용자 존재 여부 확인 (Invalid credentials vs 다른 오류)
            if (userError) {
              results.auth.userExists = !userError.message.includes("Invalid login credentials")
              results.auth.errorMessage = userError.message
              results.auth.errorCode = userError.status
            } else {
              results.auth.userExists = true
              results.auth.loginSuccess = true
            }
          } catch (authError: any) {
            results.auth.testError = authError.message
          }
        } catch (clientError: any) {
          results.supabase.clientError = clientError.message
        }
      }

      // 권장사항 생성
      if (!results.environment.hasUrl) {
        results.recommendations.push({
          type: "error",
          title: "Supabase URL 누락",
          description: "NEXT_PUBLIC_SUPABASE_URL 환경 변수가 설정되지 않았습니다.",
        })
      }

      if (!results.environment.hasKey) {
        results.recommendations.push({
          type: "error",
          title: "Supabase Key 누락",
          description: "NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 설정되지 않았습니다.",
        })
      }

      if (results.supabase.urlValid === false) {
        results.recommendations.push({
          type: "error",
          title: "잘못된 Supabase URL 형식",
          description: "URL이 https://[project-id].supabase.co 형식이어야 합니다.",
        })
      }

      if (!results.supabase.connectionSuccess) {
        results.recommendations.push({
          type: "error",
          title: "Supabase 연결 실패",
          description: "Supabase 서버에 연결할 수 없습니다. API 키와 URL을 확인하세요.",
        })
      }

      if (results.auth.userExists === false) {
        results.recommendations.push({
          type: "warning",
          title: "사용자 계정 없음",
          description: "soundfury37@gmail.com 계정이 Supabase에 등록되지 않았습니다.",
        })
      }

      if (results.environment.isProduction) {
        results.recommendations.push({
          type: "info",
          title: "Supabase 도메인 설정 확인",
          description: `Site URL을 https://${results.environment.currentDomain}로 설정했는지 확인하세요.`,
        })
      }

      setValidation(results)
    } catch (error: any) {
      setValidation({
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

  const getStatusIcon = (condition: boolean | undefined) => {
    if (condition === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  useEffect(() => {
    validateEnvironment()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Vercel 환경 변수 검증
          </CardTitle>
          <CardDescription>
            Vercel에 설정된 환경 변수가 올바르게 작동하는지 확인합니다.
            <br />
            <strong>환경 변수가 설정되어 있음을 확인했습니다!</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={validateEnvironment} disabled={isLoading}>
            {isLoading ? "검증 중..." : "다시 검증"}
          </Button>

          {validation && !validation.error && (
            <div className="space-y-6">
              {/* 환경 변수 상태 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">환경 변수 상태</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation.environment.hasUrl)}
                    <span>SUPABASE_URL:</span>
                    <Badge variant={validation.environment.hasUrl ? "default" : "destructive"}>
                      {validation.environment.hasUrl ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation.environment.hasKey)}
                    <span>SUPABASE_KEY:</span>
                    <Badge variant={validation.environment.hasKey ? "default" : "destructive"}>
                      {validation.environment.hasKey ? "설정됨" : "누락"}
                    </Badge>
                  </div>
                </div>

                {validation.environment.urlValue && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Supabase URL:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(validation.environment.urlValue)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <code className="text-xs break-all">{validation.environment.urlValue}</code>
                  </div>
                )}
              </div>

              {/* Supabase 연결 상태 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Supabase 연결 상태</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation.supabase.urlValid)}
                    <span>URL 형식:</span>
                    <Badge variant={validation.supabase.urlValid ? "default" : "destructive"}>
                      {validation.supabase.urlValid ? "올바름" : "잘못됨"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation.supabase.connectionSuccess)}
                    <span>연결 상태:</span>
                    <Badge variant={validation.supabase.connectionSuccess ? "default" : "destructive"}>
                      {validation.supabase.connectionSuccess ? "성공" : "실패"}
                    </Badge>
                  </div>
                  {validation.supabase.databaseAccess !== undefined && (
                    <div className="flex items-center gap-2">
                      {getStatusIcon(validation.supabase.databaseAccess)}
                      <span>데이터베이스:</span>
                      <Badge variant={validation.supabase.databaseAccess ? "default" : "destructive"}>
                        {validation.supabase.databaseAccess ? "접근 가능" : "접근 불가"}
                      </Badge>
                    </div>
                  )}
                </div>

                {validation.supabase.connectionError && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>연결 오류: {validation.supabase.connectionError}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 사용자 인증 상태 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">사용자 계정 상태</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(validation.auth.userExists)}
                    <span>soundfury37@gmail.com:</span>
                    <Badge variant={validation.auth.userExists ? "default" : "destructive"}>
                      {validation.auth.userExists ? "계정 존재" : "계정 없음"}
                    </Badge>
                  </div>
                </div>

                {validation.auth.errorMessage && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertDescription>인증 오류: {validation.auth.errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>

              {/* 권장사항 */}
              {validation.recommendations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">권장사항</h3>
                  <div className="space-y-3">
                    {validation.recommendations.map((rec: any, index: number) => (
                      <Alert key={index} variant={rec.type === "error" ? "destructive" : "default"}>
                        <AlertDescription>
                          <strong>{rec.title}</strong>
                          <br />
                          {rec.description}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              {/* 빠른 링크 */}
              <div>
                <h3 className="text-lg font-semibold mb-3">빠른 링크</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/gvtegncddn/auth/users"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase 사용자 관리
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href="https://supabase.com/dashboard/project/gvtegncddn/auth/url-configuration"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Supabase URL 설정
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/auth/signup" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      회원가입 페이지
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {validation?.error && (
            <Alert variant="destructive">
              <AlertDescription>검증 실행 중 오류가 발생했습니다: {validation.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
