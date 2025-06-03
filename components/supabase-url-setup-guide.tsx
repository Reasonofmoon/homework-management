"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, AlertTriangle, CheckCircle, Copy, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function SupabaseUrlSetupGuide() {
  const [copied, setCopied] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const steps = [
    {
      title: "Supabase Authentication 페이지 접속",
      description: "URL Configuration 설정을 위해 Supabase 대시보드로 이동",
      action: "링크 클릭",
    },
    {
      title: "URL Configuration 메뉴 클릭",
      description: "Authentication > URL Configuration 선택",
      action: "메뉴 클릭",
    },
    {
      title: "Site URL 설정",
      description: "프로덕션 도메인을 Site URL에 입력",
      action: "URL 복사 및 입력",
    },
    {
      title: "Redirect URLs 설정",
      description: "인증 콜백을 위한 리다이렉트 URL 추가",
      action: "URL 복사 및 추가",
    },
    {
      title: "설정 저장 및 테스트",
      description: "변경사항 저장 후 로그인 테스트",
      action: "저장 및 테스트",
    },
  ]

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <AlertTriangle className="h-5 w-5" />
          Connection Timeout 해결: URL Configuration 설정
        </CardTitle>
        <CardDescription>
          환경 변수는 정상이지만 Supabase에서 도메인이 허용되지 않아 Connection timeout이 발생합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 현재 상태 */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>환경 변수:</strong> ✅ 정상 설정됨 (URL: 40자, KEY: 219자)
            <br />
            <strong>다음 단계:</strong> Supabase URL Configuration 설정 필요
          </AlertDescription>
        </Alert>

        {/* 단계별 가이드 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">단계별 설정 가이드</h3>

          {steps.map((stepItem, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                step === index + 1 ? "border-blue-500 bg-blue-50" : "border-gray-200"
              }`}
            >
              <Badge variant={step > index + 1 ? "default" : step === index + 1 ? "secondary" : "outline"}>
                {index + 1}
              </Badge>
              <div className="flex-1">
                <h4 className="font-medium">{stepItem.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{stepItem.description}</p>
                <p className="text-xs text-blue-600 mt-1">👉 {stepItem.action}</p>
              </div>
              {step === index + 1 && <ArrowRight className="h-5 w-5 text-blue-500 mt-1" />}
            </div>
          ))}
        </div>

        {/* 1단계: Supabase 접속 */}
        {step === 1 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">1단계: Supabase Authentication 페이지 접속</h4>
            <p className="text-sm text-blue-700 mb-3">
              아래 버튼을 클릭하여 Supabase URL Configuration 페이지로 이동하세요.
            </p>
            <Button onClick={() => setStep(2)} className="mr-2" asChild>
              <a
                href="https://supabase.com/dashboard/project/gvtegncddn/auth/url-configuration"
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase URL Configuration 열기
              </a>
            </Button>
            <Button variant="outline" onClick={() => setStep(2)}>
              다음 단계
            </Button>
          </div>
        )}

        {/* 2단계: URL Configuration 메뉴 */}
        {step === 2 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">2단계: URL Configuration 메뉴 확인</h4>
            <p className="text-sm text-green-700 mb-3">
              Supabase 대시보드에서 왼쪽 메뉴의 "Authentication" → "URL Configuration"을 클릭하세요.
            </p>
            <Button variant="outline" onClick={() => setStep(3)}>
              다음 단계
            </Button>
          </div>
        )}

        {/* 3단계: Site URL 설정 */}
        {step === 3 && (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">3단계: Site URL 설정</h4>
            <p className="text-sm text-yellow-700 mb-3">"Site URL" 필드에 다음 URL을 입력하세요:</p>
            <div className="flex items-center gap-2 mb-3">
              <code className="bg-white px-3 py-2 rounded border flex-1">
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
            <Button variant="outline" onClick={() => setStep(4)}>
              다음 단계
            </Button>
          </div>
        )}

        {/* 4단계: Redirect URLs 설정 */}
        {step === 4 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">4단계: Redirect URLs 설정</h4>
            <p className="text-sm text-purple-700 mb-3">"Redirect URLs" 섹션에 다음 URL들을 추가하세요:</p>
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded border flex-1">
                  https://v0-student-homework-app.vercel.app/**
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard("https://v0-student-homework-app.vercel.app/**", "redirectUrl1")}
                >
                  {copied === "redirectUrl1" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-2 rounded border flex-1">
                  https://v0-student-homework-app.vercel.app/auth/callback
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard("https://v0-student-homework-app.vercel.app/auth/callback", "redirectUrl2")
                  }
                >
                  {copied === "redirectUrl2" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button variant="outline" onClick={() => setStep(5)}>
              다음 단계
            </Button>
          </div>
        )}

        {/* 5단계: 저장 및 테스트 */}
        {step === 5 && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">5단계: 설정 저장 및 테스트</h4>
            <div className="text-sm text-green-700 space-y-2 mb-3">
              <p>1. Supabase에서 "Save" 버튼을 클릭하여 설정을 저장하세요.</p>
              <p>2. 브라우저 캐시를 클리어하세요 (Ctrl+Shift+R 또는 Cmd+Shift+R).</p>
              <p>3. 로그인을 다시 시도하세요.</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <a href="/auth/login">로그인 페이지로 이동</a>
              </Button>
              <Button variant="outline" onClick={() => setStep(1)}>
                처음부터 다시
              </Button>
            </div>
          </div>
        )}

        {/* 진행 상황 표시 */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">진행 상황:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className={`w-3 h-3 rounded-full ${step >= num ? "bg-blue-500" : "bg-gray-200"}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600">{step}/5</span>
        </div>

        {/* 추가 도움말 */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>중요:</strong> URL Configuration 설정 후 즉시 적용되지만, 브라우저 캐시 때문에 문제가 지속될 수
            있습니다. 설정 완료 후 반드시 브라우저 캐시를 클리어하고 다시 시도하세요.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
