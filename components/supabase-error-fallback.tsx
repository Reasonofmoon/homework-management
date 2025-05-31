"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, RefreshCw, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"
import { validateSupabaseConfig } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SupabaseErrorFallbackProps {
  error: string | null
  isLoading: boolean
  configValid: boolean
  onRetry?: () => void
}

export function SupabaseErrorFallback({ error, isLoading, configValid, onRetry }: SupabaseErrorFallbackProps) {
  const [configDetails, setConfigDetails] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check configuration details
    const validation = validateSupabaseConfig()
    setConfigDetails(validation)

    // Check online status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "복사됨",
      description: "클립보드에 복사되었습니다.",
    })
  }

  const isNetworkError = error?.includes("네트워크") || error?.includes("fetch") || !isOnline

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            {isNetworkError ? (
              <WifiOff className="h-5 w-5 text-red-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            <CardTitle className="text-red-600">
              {isNetworkError ? "네트워크 연결 오류" : "데이터베이스 연결 오류"}
            </CardTitle>
          </div>
          <CardDescription>
            {isNetworkError ? "Supabase 서버에 연결할 수 없습니다." : "Supabase 연결에 문제가 발생했습니다."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Network Status */}
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <span className="text-sm">
              네트워크 상태:{" "}
              <Badge variant={isOnline ? "default" : "destructive"}>{isOnline ? "온라인" : "오프라인"}</Badge>
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Configuration Status */}
          {configDetails && (
            <div className="space-y-3">
              <p className="font-medium text-sm">환경 변수 상태:</p>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2">
                  {configDetails.config.hasUrl ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm flex-1">
                    NEXT_PUBLIC_SUPABASE_URL:{" "}
                    <Badge variant={configDetails.config.hasUrl ? "default" : "destructive"}>
                      {configDetails.config.hasUrl ? `설정됨 (${configDetails.config.urlLength}자)` : "설정되지 않음"}
                    </Badge>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {configDetails.config.hasKey ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    NEXT_PUBLIC_SUPABASE_ANON_KEY:{" "}
                    <Badge variant={configDetails.config.hasKey ? "default" : "destructive"}>
                      {configDetails.config.hasKey ? `설정됨 (${configDetails.config.keyLength}자)` : "설정되지 않음"}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Manual Configuration Form */}
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">환경 변수 설정 방법:</p>
            <ol className="text-xs space-y-1 list-decimal pl-5">
              <li>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Supabase 대시보드
                </a>
                에 로그인하세요.
              </li>
              <li>프로젝트를 선택하고 Settings → API로 이동하세요.</li>
              <li>
                <strong>Project URL</strong>과 <strong>anon public</strong> 키를 복사하세요.
              </li>
              <li>
                Vercel 대시보드에서 프로젝트 설정 → Environment Variables에 다음 값을 추가하세요:
                <ul className="list-disc pl-5 mt-1">
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>: Project
                    URL
                  </li>
                  <li>
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>:
                    anon public 키
                  </li>
                </ul>
              </li>
              <li>변경사항을 저장하고 프로젝트를 다시 배포하세요.</li>
            </ol>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          {onRetry && (
            <Button onClick={onRetry} disabled={isLoading} className="flex-1">
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "연결 중..." : "다시 시도"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
