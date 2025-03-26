import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
// Update the import to use default export if needed
import TutorialContent from "@/components/tutorial-content"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-blue-950">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter text-blue-800 dark:text-blue-300 sm:text-5xl xl:text-6xl/none">
                    학생 숙제 관리 시스템
                  </h1>
                  <p className="max-w-[600px] text-blue-700/80 dark:text-blue-400/80 md:text-xl">
                    구글 시트와 연동하여 학생별 숙제를 효율적으로 관리하고 추적하세요. 간편한 인터페이스로 숙제 할당 및
                    진행 상황을 한눈에 확인할 수 있습니다.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
                      시작하기
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Card className="w-full border-blue-200 dark:border-blue-800 shadow-lg">
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <TutorialContent />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

