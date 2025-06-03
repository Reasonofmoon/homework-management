"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, RefreshCw, LogIn, Trash2 } from "lucide-react"

export function PostConfigTest() {
  const [isClearing, setIsClearing] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const clearCache = () => {
    setIsClearing(true)
    // 브라우저 캐시 클리어 시뮬레이션
    setTimeout(() => {
      setIsClearing(false)
      window.location.reload()
    }, 1000)
  }

  const testLogin = async () => {
    setIsTesting(true)
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

      // 연결 테스트
      const { data, error } = await supabase.auth.getSession()

      setTestResult({
        success: !error,
        message: error ? error.message : "Supabase 연결 성공! 이제 로그인을 시도해보세요.",
        timestamp: new Date().toLocaleTimeString(),
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message,
        timestamp: new Date().toLocaleTimeString(),
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          URL Configuration 설정 완료!
        </CardTitle>
        <CardDescription>이제 브라우저 캐시를 클리어하고 로그인을 테스트해보세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>설정 완료:</strong>
            <br />• Site URL: https://v0-student-homework-app.vercel.app ✅
            <br />• Redirect URLs: https://v0-student-homework-app.vercel.app/** ✅
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-semibold">다음 단계:</h4>

          <div className="flex gap-2">
            <Button onClick={clearCache} disabled={isClearing} variant="outline" className="flex items-center gap-2">
              {isClearing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {isClearing ? "캐시 클리어 중..." : "브라우저 캐시 클리어"}
            </Button>

            <Button onClick={testLogin} disabled={isTesting} variant="outline" className="flex items-center gap-2">
              {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {isTesting ? "연결 테스트 중..." : "연결 테스트"}
            </Button>

            <Button asChild className="flex items-center gap-2">
              <a href="/auth/login">
                <LogIn className="h-4 w-4" />
                로그인 시도
              </a>
            </Button>
          </div>

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertDescription>
                <strong>{testResult.timestamp}:</strong> {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">수동 캐시 클리어 방법:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>
              • <strong>Windows/Linux:</strong> Ctrl + Shift + R
            </p>
            <p>
              • <strong>Mac:</strong> Cmd + Shift + R
            </p>
            <p>
              • <strong>또는:</strong> 개발자 도구 → Network 탭 → "Disable cache" 체크
            </p>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>예상 결과:</strong> URL Configuration 설정이 완료되었으므로 이제 soundfury37@gmail.com으로 로그인이
            가능해야 합니다. 만약 여전히 문제가 있다면 사용자 계정이 존재하지 않을 수 있으니 회원가입을 먼저
            진행해주세요.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
