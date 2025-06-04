"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentAssignments } from "@/components/recent-assignments"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { StudentProgress } from "@/components/student-progress"
import { DatabaseStatus } from "@/components/database-status"
import { Skeleton } from "@/components/ui/skeleton"
import { ConnectionStatus } from "@/components/connection-status"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { HelpButton } from "@/components/help-button"
import { LocalModeBanner } from "@/components/local-mode-banner"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="border-b border-blue-100 dark:border-blue-900 bg-white dark:bg-gray-950">
        <div className="container flex h-16 items-center px-2 sm:px-4">
          <MainNav />
          <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
            <HelpButton />
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <div className="container px-4 py-4">
        <LocalModeBanner />
        <ConnectionStatus>
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">대시보드</h1>
              <p className="text-muted-foreground">학생 숙제 관리 시스템에 오신 것을 환영합니다.</p>
            </div>

            {/* Dashboard content will go here */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Add your dashboard widgets here */}
              <Card>
                <CardHeader>
                  <CardTitle>전체 학생 수</CardTitle>
                  <CardDescription>등록된 학생 수</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">데이터베이스 설정 후 표시됩니다</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>활성 과제</CardTitle>
                  <CardDescription>진행 중인 과제 수</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">데이터베이스 설정 후 표시됩니다</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>완료율</CardTitle>
                  <CardDescription>전체 과제 완료율</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">데이터베이스 설정 후 표시됩니다</p>
                </CardContent>
              </Card>

              <DatabaseStatus />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">학생 관리</h2>
                <p className="text-gray-600">학생 정보를 관리하세요</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">숙제 관리</h2>
                <p className="text-gray-600">숙제를 생성하고 배정하세요</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">진도 추적</h2>
                <p className="text-gray-600">학습 진도를 확인하세요</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Suspense fallback={<Skeleton className="h-[300px]" />}>
                <RecentAssignments />
              </Suspense>
              <Suspense fallback={<Skeleton className="h-[300px]" />}>
                <UpcomingDeadlines />
              </Suspense>
            </div>

            <Suspense fallback={<Skeleton className="h-[200px]" />}>
              <StudentProgress />
            </Suspense>
          </div>
        </ConnectionStatus>
      </div>
    </div>
  )
}
