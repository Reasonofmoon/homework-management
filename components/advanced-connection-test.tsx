"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, RefreshCw, Database, Wifi, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"

export function AdvancedConnectionTest() {
  const [testResults, setTestResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runConnectionTest = async () => {
    setIsLoading(true)
    try {
      const results: any = {
        timestamp: new Date().toISOString(),
        environment: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          currentDomain: window.location.hostname,
          fullUrl: window.location.href,
          isProduction: process.env.NODE_ENV === "production",
        },
        network: {},
        supabase: {},
        auth: {},
        database: {},
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
        } catch (e: any) {
          results.supabase.domainReachable = false
          results.supabase.domainError = e.message
        }
      }

      // Supabase Auth 테스트
      if (results.environment.hasUrl && results.environment.hasKey) {
        try {
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

          // 사용자 확인
          const { data: userData, error: userError } = await supabase.auth.getUser()
          results.auth.userCheck = {
            success: !userError,
            error: userError?.message,
            hasUser: !!userData.user,
          }

          // 데이터베이스 테이블 확인
          try {
            const { data: tablesData, error: tablesError } = await supabase
              .from("profiles")
              .select("count", { count: "exact", head: true })

            results.database.profilesTable = {
              exists: !tablesError,
              error: tablesError?.message,
            }
          } catch (e: any) {
            results.database.profilesTable = {
              exists: false,
              error: e.message,
            }
          }

          try {
            const { data: classesData, error: classesError } = await supabase
              .from("classes")
              .select("count", { count: "exact", head: true })

            results.database.classesTable = {
              exists: !classesError,
              error: classesError?.message,
            }
          } catch (e: any) {
            results.database.classesTable = {
              exists: false,
              error: e.message,
            }
          }
        } catch (e: any) {
          results.auth.clientError = e.message
        }
      }

      setTestResults(results)
    } catch (error: any) {
      setTestResults({ error: error.message, timestamp: new Date().toISOString() })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (condition: boolean | undefined) => {
    if (condition === undefined) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="md:col-span-2 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          고급 연결 테스트
        </CardTitle>
        <CardDescription>Supabase 연결, 인증, 데이터베이스 상태를 종합적으로 진단합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runConnectionTest} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              연결 테스트 중...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              연결 테스트 실행
            </>
          )}
        </Button>

        {testResults && !testResults.error && (
          <div className="space-y-6">
            {/* 환경 변수 상태 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                환경 변수 상태
              </h4>
              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.environment.hasUrl)}
                  <span className="text-sm">Supabase URL: {testResults.environment.hasUrl ? "설정됨" : "누락"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.environment.hasKey)}
                  <span className="text-sm">API Key: {testResults.environment.hasKey ? "설정됨" : "누락"}</span>
                </div>
              </div>
              {testResults.environment.urlDetails && (
                <div className="mt-2 ml-6 text-xs text-muted-foreground">
                  <div>도메인: {testResults.environment.urlDetails.domain}</div>
                  <div>HTTPS: {testResults.environment.urlDetails.startsWithHttps ? "✓" : "✗"}</div>
                </div>
              )}
            </div>

            {/* 네트워크 연결 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                네트워크 연결
              </h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.network.externalConnection)}
                <span className="text-sm">외부 연결: {testResults.network.externalConnection ? "정상" : "실패"}</span>
                {testResults.network.externalStatus && (
                  <Badge variant="outline">HTTP {testResults.network.externalStatus}</Badge>
                )}
              </div>
              {testResults.network.externalError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    <strong>네트워크 오류:</strong> {testResults.network.externalError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Supabase 연결 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase 연결
              </h4>
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.supabase.domainReachable)}
                <span className="text-sm">도메인 접근: {testResults.supabase.domainReachable ? "성공" : "실패"}</span>
                {testResults.supabase.domainStatus && (
                  <Badge variant="outline">HTTP {testResults.supabase.domainStatus}</Badge>
                )}
              </div>
              {testResults.supabase.domainError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    <strong>Supabase 연결 오류:</strong> {testResults.supabase.domainError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 인증 상태 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                인증 상태
              </h4>
              <div className="space-y-2">
                {testResults.auth.sessionCheck && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.auth.sessionCheck.success)}
                    <span className="text-sm">
                      세션 확인: {testResults.auth.sessionCheck.success ? "성공" : "실패"}
                    </span>
                  </div>
                )}
                {testResults.auth.userCheck && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.auth.userCheck.success)}
                    <span className="text-sm">사용자 확인: {testResults.auth.userCheck.success ? "성공" : "실패"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 데이터베이스 테이블 */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Database className="h-4 w-4" />
                데이터베이스 테이블
              </h4>
              <div className="space-y-2">
                {testResults.database.profilesTable && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.database.profilesTable.exists)}
                    <span className="text-sm">
                      Profiles 테이블: {testResults.database.profilesTable.exists ? "존재함" : "누락"}
                    </span>
                  </div>
                )}
                {testResults.database.classesTable && (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.database.classesTable.exists)}
                    <span className="text-sm">
                      Classes 테이블: {testResults.database.classesTable.exists ? "존재함" : "누락"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 해결 방법 */}
            <div>
              <h4 className="font-semibold mb-3">해결 방법</h4>
              <div className="space-y-2">
                {!testResults.network.externalConnection && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>네트워크 문제:</strong> 인터넷 연결을 확인하거나 방화벽 설정을 점검하세요.
                    </AlertDescription>
                  </Alert>
                )}

                {!testResults.supabase.domainReachable && testResults.network.externalConnection && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>Supabase 연결 문제:</strong>
                      <br />
                      1. 환경 변수의 URL과 API 키가 올바른지 확인
                      <br />
                      2. Supabase 프로젝트가 활성화되어 있는지 확인
                      <br />
                      3. URL Configuration에서 도메인이 허용되어 있는지 확인
                    </AlertDescription>
                  </Alert>
                )}

                {testResults.auth.sessionCheck && !testResults.auth.sessionCheck.success && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>인증 문제:</strong> 로그인이 필요하거나 세션이 만료되었습니다.
                    </AlertDescription>
                  </Alert>
                )}

                {(!testResults.database.profilesTable?.exists || !testResults.database.classesTable?.exists) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <strong>데이터베이스 테이블 누락:</strong> 필요한 테이블이 생성되지 않았습니다. 데이터베이스
                      스키마를 확인하고 테이블을 생성하세요.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* 유용한 링크 */}
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <a href="https://supabase.com/dashboard/project/gvtegncddn" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Supabase 대시보드
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://supabase.com/dashboard/project/gvtegncddn/auth/url-configuration"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  URL 설정
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                페이지 새로고침
              </Button>
            </div>
          </div>
        )}

        {testResults?.error && (
          <Alert variant="destructive">
            <AlertDescription>
              <strong>테스트 실행 중 오류:</strong> {testResults.error}
              <br />
              <small>시간: {testResults.timestamp}</small>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
