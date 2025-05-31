"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const setupSteps = [
  {
    id: 1,
    title: "Supabase 프로젝트 생성",
    description: "supabase.com에서 새 프로젝트를 생성하세요.",
    action: "Supabase 대시보드 열기",
    url: "https://supabase.com/dashboard",
  },
  {
    id: 2,
    title: "데이터베이스 스키마 설정",
    description: "SQL 편집기에서 database/setup.sql 파일을 실행하세요.",
    action: "SQL 복사",
    sql: true,
  },
  {
    id: 3,
    title: "환경 변수 확인",
    description: "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되었는지 확인하세요.",
    action: "설정 완료",
  },
  {
    id: 4,
    title: "인증 설정",
    description: "Supabase 대시보드에서 이메일 인증을 활성화하세요.",
    action: "인증 설정 열기",
    url: "https://supabase.com/dashboard/project/_/auth/settings",
  },
]

export function SetupGuide() {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const { toast } = useToast()

  const toggleStep = (stepId: number) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev.filter((id) => id !== stepId) : [...prev, stepId]))
  }

  const copySQL = async () => {
    try {
      const response = await fetch("/database/setup.sql")
      const sql = await response.text()
      await navigator.clipboard.writeText(sql)
      toast({
        title: "SQL 복사됨",
        description: "SQL 스크립트가 클립보드에 복사되었습니다.",
      })
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "SQL 스크립트 복사에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleAction = (step: (typeof setupSteps)[0]) => {
    if (step.sql) {
      copySQL()
    } else if (step.url) {
      window.open(step.url, "_blank")
    }
    toggleStep(step.id)
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Supabase 설정 가이드</CardTitle>
        <CardDescription>다음 단계를 따라 Supabase 데이터베이스를 설정하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {setupSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                completedSteps.includes(step.id) ? "bg-green-50 border-green-200" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                    completedSteps.includes(step.id) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {completedSteps.includes(step.id) ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {completedSteps.includes(step.id) && (
                  <Badge variant="default" className="bg-green-500">
                    완료
                  </Badge>
                )}
                <Button
                  onClick={() => handleAction(step)}
                  size="sm"
                  variant={completedSteps.includes(step.id) ? "outline" : "default"}
                >
                  {step.sql && <Copy className="w-4 h-4 mr-1" />}
                  {step.url && <ExternalLink className="w-4 h-4 mr-1" />}
                  {step.action}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {completedSteps.length === setupSteps.length && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">설정 완료!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              모든 설정이 완료되었습니다. 이제 숙제 관리 시스템을 사용할 수 있습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
