"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, AlertTriangle, CheckCircle, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ConnectionTimeoutFix() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const currentDomain = typeof window !== "undefined" ? window.location.origin : ""

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Connection Timeout 해결 방법
        </CardTitle>
        <CardDescription>
          환경 변수는 정상이지만 Supabase 연결이 타임아웃되고 있습니다. 도메인 설정을 확인해주세요.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 즉시 해결 방법 */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>가장 가능성 높은 원인:</strong> Supabase에서 현재 도메인이 허용되지 않음
          </AlertDescription>
        </Alert>

        {/* Supabase 설정 단계 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">1. Supabase 도메인 설정</h3>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <p className="font-medium">다음 URL들을 Supabase에 추가해야 합니다:</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Site URL:</span>
                <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                  https://v0-student-homework-app.vercel.app
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("https://v0-student-homework-app.vercel.app", "siteUrl")}
                >
                  {copied === "siteUrl" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Redirect URLs:</span>
                <code className="bg-white px-2 py-1 rounded text-sm flex-1">
                  https://v0-student-homework-app.vercel.app/**
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("https://v0-student-homework-app.vercel.app/**", "redirectUrl")}
                >
                  {copied === "redirectUrl" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild>
              <a
                href="https://supabase.com/dashboard/project/gvtegncddn/auth/url-configuration"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase URL 설정 페이지 열기
              </a>
            </Button>
          </div>
        </div>

        {/* 단계별 가이드 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">2. 단계별 설정 가이드</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div>
                <p className="font-medium">Supabase Dashboard 접속</p>
                <p className="text-sm text-gray-600">위의 "Supabase URL 설정 페이지 열기" 버튼 클릭</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div>
                <p className="font-medium">Site URL 설정</p>
                <p className="text-sm text-gray-600">
                  Site URL 필드에 <code>https://v0-student-homework-app.vercel.app</code> 입력
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div>
                <p className="font-medium">Redirect URLs 설정</p>
                <p className="text-sm text-gray-600">
                  Redirect URLs 필드에 <code>https://v0-student-homework-app.vercel.app/**</code> 추가
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                4
              </Badge>
              <div>
                <p className="font-medium">설정 저장</p>
                <p className="text-sm text-gray-600">Save 버튼 클릭하여 설정 저장</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                5
              </Badge>
              <div>
                <p className="font-medium">로그인 테스트</p>
                <p className="text-sm text-gray-600">설정 완료 후 다시 로그인 시도</p>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 확인 사항 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>참고:</strong> 설정 변경 후 즉시 적용되지만, 브라우저 캐시를 클리어하고 다시 시도해보세요.
          </AlertDescription>
        </Alert>

        {/* 대안 해결책 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">3. 대안 해결책</h3>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-800 mb-2">임시 해결책:</p>
            <p className="text-sm text-blue-700">
              만약 위 방법이 작동하지 않으면, 먼저 회원가입을 통해 새 계정을 만들어보세요.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <a href="/auth/signup">회원가입 페이지로 이동</a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
