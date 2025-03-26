import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, GraduationCap, HelpCircle, ListChecks, Users } from "lucide-react"
import { RecentAssignments } from "@/components/recent-assignments"
import { UpcomingDeadlines } from "@/components/upcoming-deadlines"
import { StudentProgress } from "@/components/student-progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// Update the import to use default export if needed
import TutorialContent from "@/components/tutorial-content"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-blue-800 dark:text-blue-300">대시보드</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-200"
            >
              <HelpCircle className="h-4 w-4" />
              사용 가이드
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-blue-700 dark:text-blue-300">학생 숙제 관리 시스템 사용 가이드</DialogTitle>
              <DialogDescription>시스템 사용 방법에 대한 상세한 안내입니다.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-full pr-4">
              <TutorialContent />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
          >
            개요
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
          >
            분석
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">전체 학생 수</CardTitle>
                <Users className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">24명</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">지난 달 대비 +2명</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">활성 숙제</CardTitle>
                <ListChecks className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">12개</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">이번 주 마감 6개</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">평균 완료율</CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">78%</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">지난 주 대비 +5%</p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">다가오는 마감일</CardTitle>
                <CalendarDays className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">3일</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">3월 27일까지</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">최근 등록된 숙제</CardTitle>
                <CardDescription>최근에 등록된 숙제 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAssignments />
              </CardContent>
            </Card>
            <Card className="col-span-3 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">다가오는 마감일</CardTitle>
                <CardDescription>곧 마감되는 숙제 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingDeadlines />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            <Card className="border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">학생별 진행 상황</CardTitle>
                <CardDescription>학생별 숙제 완료 현황입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentProgress />
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="ml-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      사용 방법 보기
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="text-blue-700 dark:text-blue-300">
                        학생 숙제 관리 시스템 사용 가이드
                      </DialogTitle>
                      <DialogDescription>시스템 사용 방법에 대한 상세한 안내입니다.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-full pr-4">
                      <TutorialContent />
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">월별 숙제 완료율</CardTitle>
                <CardDescription>월별 학생들의 숙제 완료율 추이입니다.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                  차트 데이터 준비 중...
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">숙제 유형별 분포</CardTitle>
                <CardDescription>숙제 유형별 분포 현황입니다.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="flex h-full items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                  차트 데이터 준비 중...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

