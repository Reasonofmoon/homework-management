import { AppsScriptEditor } from "@/components/apps-script-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCode, FileSpreadsheet, FileText, Bot } from "lucide-react"

export default function AppsScriptPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Google Apps Script</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileCode className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle>Apps Script란?</CardTitle>
              <CardDescription>Google 서비스를 자동화하는 JavaScript 기반 스크립팅 플랫폼</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Google Apps Script는 Google Workspace 애플리케이션을 확장하고 자동화하기 위한 JavaScript 기반 개발
              플랫폼입니다. 교육자는 이를 통해 학생 데이터 관리, 성적 분석, 자동 이메일 발송 등 다양한 업무를 자동화할
              수 있습니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 rounded-md border p-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <div className="text-sm">Google Sheets 연동</div>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <div className="text-sm">Google Forms 연동</div>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <div className="text-sm">자동화 워크플로우</div>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2">
                <FileCode className="h-5 w-5 text-orange-600" />
                <div className="text-sm">사용자 정의 함수</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>시작하기</CardTitle>
            <CardDescription>Apps Script를 시작하는 방법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">1. Google Sheets에서 시작하기</h3>
              <p className="text-sm text-muted-foreground">
                Google Sheets에서 '확장 프로그램' &gt; 'Apps Script'를 클릭하여 시작할 수 있습니다.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">2. 스크립트 작성하기</h3>
              <p className="text-sm text-muted-foreground">
                JavaScript 기반 코드를 작성하여 Google 서비스와 상호작용할 수 있습니다.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">3. 트리거 설정하기</h3>
              <p className="text-sm text-muted-foreground">
                특정 이벤트(시간, 폼 제출 등)에 스크립트가 자동으로 실행되도록 트리거를 설정할 수 있습니다.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">4. 배포하기</h3>
              <p className="text-sm text-muted-foreground">
                웹 앱이나 애드온으로 배포하여 다른 사용자와 공유할 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <AppsScriptEditor />
    </div>
  )
}
