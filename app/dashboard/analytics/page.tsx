import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GradeAnalytics } from "@/components/grade-analytics"
import { NotificationSettings } from "@/components/notification-settings"

export default function AnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">성적 및 통계 분석</h2>
      </div>

      <div className="grid gap-4">
        <GradeAnalytics />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>월별 숙제 완료율</CardTitle>
            <CardDescription>월별 학생들의 숙제 완료율 추이입니다.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="flex h-full items-center justify-center text-blue-600/70 dark:text-blue-400/70">
              차트 데이터 준비 중...
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>숙제 유형별 분포</CardTitle>
            <CardDescription>숙제 유형별 분포 현황입니다.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <div className="flex h-full items-center justify-center text-blue-600/70 dark:text-blue-400/70">
              차트 데이터 준비 중...
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <NotificationSettings />
      </div>
    </div>
  )
}
