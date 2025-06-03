"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, User, Database, Key, AlertTriangle } from "lucide-react"
import {
  getSupabaseClient,
  testSupabaseConnection,
  checkDatabaseHealth,
  validateSupabaseConfig,
} from "@/lib/supabase/client"

export default function AuthDebug() {
  const [loading, setLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<any>(null)
  const [dbHealth, setDbHealth] = useState<any>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [userStatus, setUserStatus] = useState<any>(null)
  const [authUsers, setAuthUsers] = useState<any[]>([])

  const supabase = getSupabaseClient()

  const runDiagnostics = async () => {
    setLoading(true)

    try {
      // 1. 환경 변수 확인
      const config = validateSupabaseConfig()
      setConfigStatus(config)

      // 2. 연결 테스트
      const connection = await testSupabaseConnection()
      setConnectionStatus(connection)

      // 3. 데이터베이스 상태 확인
      const health = await checkDatabaseHealth()
      setDbHealth(health)

      // 4. 현재 사용자 세션 확인
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      setUserStatus({
        hasSession: !!session.session,
        user: session.session?.user || null,
        error: sessionError,
      })

      // 5. 특정 이메일로 사용자 조회 시도 (관리자 권한 필요)
      try {
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
        if (!usersError) {
          const targetUser = users.users.find((u) => u.email === "soundfury37@gmail.com")
          setAuthUsers(targetUser ? [targetUser] : [])
        }
      } catch (adminError) {
        console.log("Admin access not available:", adminError)
      }
    } catch (error) {
      console.error("Diagnostics error:", error)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "soundfury37@gmail.com",
        password: "test123", // 임시 비밀번호 - 실제로는 사용자가 입력해야 함
      })

      if (error) {
        console.error("Login test error:", error)
        alert(`로그인 오류: ${error.message}`)
      } else {
        console.log("Login test success:", data)
        alert("로그인 테스트 성공!")
      }
    } catch (error) {
      console.error("Login test failed:", error)
      alert("로그인 테스트 실패")
    } finally {
      setLoading(false)
    }
  }

  const createTestUser = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: "soundfury37@gmail.com",
        password: "test123456", // 강력한 임시 비밀번호
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        alert(`회원가입 오류: ${error.message}`)
      } else {
        console.log("Signup success:", data)
        alert("회원가입 성공! 이메일 확인이 필요할 수 있습니다.")
      }
    } catch (error) {
      console.error("Signup failed:", error)
      alert("회원가입 실패")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            인증 문제 진단
          </CardTitle>
          <CardDescription>soundfury37@gmail.com 로그인 문제를 진단합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <RefreshCw className="mr-2 h-4 w-4" />
              진단 실행
            </Button>
            <Button onClick={testLogin} variant="outline" disabled={loading}>
              <User className="mr-2 h-4 w-4" />
              로그인 테스트
            </Button>
            <Button onClick={createTestUser} variant="outline" disabled={loading}>
              <User className="mr-2 h-4 w-4" />
              테스트 사용자 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 환경 변수 상태 */}
      {configStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              환경 변수 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>설정 유효성:</span>
                <Badge variant={configStatus.isValid ? "default" : "destructive"}>
                  {configStatus.isValid ? "유효" : "무효"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Supabase URL:</span>
                <Badge variant={configStatus.config.hasUrl ? "default" : "destructive"}>
                  {configStatus.config.hasUrl ? `설정됨 (${configStatus.config.urlLength}자)` : "미설정"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Anon Key:</span>
                <Badge variant={configStatus.config.hasKey ? "default" : "destructive"}>
                  {configStatus.config.hasKey ? `설정됨 (${configStatus.config.keyLength}자)` : "미설정"}
                </Badge>
              </div>
              {configStatus.issues.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {configStatus.issues.map((issue: string, index: number) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 연결 상태 */}
      {connectionStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Supabase 연결 상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>연결 상태:</span>
                <Badge variant={connectionStatus.success ? "default" : "destructive"}>
                  {connectionStatus.success ? "연결됨" : "연결 실패"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>세션 상태:</span>
                <Badge variant={connectionStatus.hasSession ? "default" : "secondary"}>
                  {connectionStatus.hasSession ? "활성 세션" : "세션 없음"}
                </Badge>
              </div>
              {!connectionStatus.success && (
                <Alert variant="destructive">
                  <AlertDescription>{connectionStatus.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 데이터베이스 상태 */}
      {dbHealth && (
        <Card>
          <CardHeader>
            <CardTitle>데이터베이스 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>데이터베이스 상태:</span>
                <Badge variant={dbHealth.success ? "default" : "destructive"}>
                  {dbHealth.success ? "정상" : "문제 있음"}
                </Badge>
              </div>
              {dbHealth.tables && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">테이블 상태:</span>
                  {dbHealth.tables.map((table: any) => (
                    <div key={table.table} className="flex items-center justify-between text-sm">
                      <span>{table.table}:</span>
                      <Badge variant={table.exists ? "default" : "destructive"} className="text-xs">
                        {table.exists ? "존재" : "누락"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {!dbHealth.success && (
                <Alert variant="destructive">
                  <AlertDescription>{dbHealth.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사용자 세션 상태 */}
      {userStatus && (
        <Card>
          <CardHeader>
            <CardTitle>현재 사용자 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>세션:</span>
                <Badge variant={userStatus.hasSession ? "default" : "secondary"}>
                  {userStatus.hasSession ? "로그인됨" : "로그아웃됨"}
                </Badge>
              </div>
              {userStatus.user && (
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>이메일:</strong> {userStatus.user.email}
                  </div>
                  <div>
                    <strong>ID:</strong> {userStatus.user.id}
                  </div>
                  <div>
                    <strong>생성일:</strong> {new Date(userStatus.user.created_at).toLocaleString()}
                  </div>
                  <div>
                    <strong>이메일 확인:</strong> {userStatus.user.email_confirmed_at ? "확인됨" : "미확인"}
                  </div>
                </div>
              )}
              {userStatus.error && (
                <Alert variant="destructive">
                  <AlertDescription>{userStatus.error.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 사용자 정보 */}
      {authUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {authUsers.map((user) => (
              <div key={user.id} className="space-y-2 text-sm">
                <div>
                  <strong>이메일:</strong> {user.email}
                </div>
                <div>
                  <strong>상태:</strong> {user.email_confirmed_at ? "이메일 확인됨" : "이메일 미확인"}
                </div>
                <div>
                  <strong>마지막 로그인:</strong>{" "}
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "없음"}
                </div>
                <div>
                  <strong>생성일:</strong> {new Date(user.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
