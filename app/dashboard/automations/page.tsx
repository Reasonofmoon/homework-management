import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bot, ExternalLink, FileCode, FileText, Mail, MessageSquare } from "lucide-react"

export default function AutomationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">자동화 워크플로우</h2>
      </div>

      <Tabs defaultValue="power-automate" className="space-y-4">
        <TabsList className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-900">
          <TabsTrigger
            value="power-automate"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
          >
            Power Automate
          </TabsTrigger>
          <TabsTrigger
            value="zapier"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
          >
            Zapier
          </TabsTrigger>
          <TabsTrigger
            value="apps-script"
            className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
          >
            Apps Script
          </TabsTrigger>
        </TabsList>

        <TabsContent value="power-automate" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  Power Automate란?
                </CardTitle>
                <CardDescription>Microsoft의 자동화 워크플로우 플랫폼</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Microsoft Power Automate(이전의 Flow)는 다양한 앱과 서비스 간의 자동화된 워크플로우를 만들 수 있는
                  클라우드 기반 서비스입니다. 반복적인 작업을 자동화하여 시간을 절약하고 효율성을 높일 수 있습니다.
                </p>
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">주요 기능</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>트리거 기반 자동화 워크플로우</li>
                    <li>Microsoft 365 앱과의 긴밀한 통합</li>
                    <li>AI 기반 자동화 기능</li>
                    <li>모바일 앱을 통한 워크플로우 관리</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://make.powerautomate.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Power Automate 시작하기
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>교육자를 위한 자동화 템플릿</CardTitle>
                <CardDescription>바로 사용할 수 있는 Power Automate 템플릿</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">학생 등록 자동화</h3>
                    <Badge>인기</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Google Form으로 수집된 학생 정보를 자동으로 데이터베이스에 추가하고 환영 이메일 발송
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">과제 제출 알림</h3>
                    <Badge variant="outline">기본</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    과제 제출 시 자동 확인 이메일 발송 및 마감일 전 미제출 학생에게 알림
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">성적 분석 자동화</h3>
                    <Badge variant="outline">고급</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    시험 결과가 입력되면 자동으로 성적 분석 및 리포트 생성
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Power Automate 시작하기</CardTitle>
              <CardDescription>단계별 가이드</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      1
                    </div>
                    <h3 className="text-sm font-medium">계정 만들기</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Microsoft 계정으로 Power Automate에 로그인하세요.</p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      2
                    </div>
                    <h3 className="text-sm font-medium">커넥터 설정</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Google Sheets, Forms 등 필요한 서비스에 연결하세요.</p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      3
                    </div>
                    <h3 className="text-sm font-medium">플로우 만들기</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">트리거와 액션을 설정하여 워크플로우를 만드세요.</p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      4
                    </div>
                    <h3 className="text-sm font-medium">테스트 및 배포</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">플로우를 테스트하고 활성화하여 자동화를 시작하세요.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">자세한 가이드 보기</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="zapier" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-orange-600" />
                  Zapier란?
                </CardTitle>
                <CardDescription>3,000개 이상의 앱을 연결하는 자동화 플랫폼</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Zapier는 다양한 웹 애플리케이션 간의 자동화된 워크플로우(Zap)를 만들 수 있는 서비스입니다. 트리거와
                  액션을 설정하여 앱 간의 데이터 이동과 작업을 자동화할 수 있습니다.
                </p>
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">주요 기능</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>3,000개 이상의 앱 연동 지원</li>
                    <li>코딩 없이 자동화 워크플로우 구축</li>
                    <li>멀티 스텝 Zap으로 복잡한 워크플로우 구현</li>
                    <li>필터와 포맷팅으로 데이터 처리</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://zapier.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Zapier 시작하기
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>교육자를 위한 Zap 템플릿</CardTitle>
                <CardDescription>바로 사용할 수 있는 Zapier 템플릿</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">문서 자동 생성</h3>
                    <Badge>인기</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">새 학생 등록 시 Google Drive에 학생별 폴더 자동 생성</p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">SMS 알림 발송</h3>
                    <Badge variant="outline">기본</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">마감일 1일 전 미제출 학생에게 SMS 알림 자동 발송</p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">캘린더 일정 동기화</h3>
                    <Badge variant="outline">고급</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    새로운 과제나 시험이 등록되면 Google 캘린더에 자동으로 일정 추가
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Zapier 시작하기</CardTitle>
              <CardDescription>단계별 가이드</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                      1
                    </div>
                    <h3 className="text-sm font-medium">계정 만들기</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Zapier 웹사이트에서 무료 계정을 만드세요.</p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                      2
                    </div>
                    <h3 className="text-sm font-medium">앱 연결</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Google Workspace, Twilio 등 필요한 앱에 연결하세요.</p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                      3
                    </div>
                    <h3 className="text-sm font-medium">Zap 만들기</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    트리거와 액션을 설정하여 자동화 워크플로우를 만드세요.
                  </p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                      4
                    </div>
                    <h3 className="text-sm font-medium">테스트 및 활성화</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">Zap을 테스트하고 활성화하여 자동화를 시작하세요.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">자세한 가이드 보기</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="apps-script" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-blue-600" />
                  Apps Script란?
                </CardTitle>
                <CardDescription>Google 서비스를 자동화하는 JavaScript 기반 스크립팅 플랫폼</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Google Apps Script는 Google Workspace 애플리케이션을 확장하고 자동화하기 위한 JavaScript 기반 개발
                  플랫폼입니다. 교육자는 이를 통해 학생 데이터 관리, 성적 분석, 자동 이메일 발송 등 다양한 업무를
                  자동화할 수 있습니다.
                </p>
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">주요 기능</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Google Sheets, Forms, Docs 등과의 긴밀한 통합</li>
                    <li>사용자 정의 함수 및 매크로 생성</li>
                    <li>시간 기반 트리거 설정</li>
                    <li>웹 앱 및 애드온 개발</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Apps Script 시작하기
                  </a>
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>교육자를 위한 스크립트 템플릿</CardTitle>
                <CardDescription>바로 사용할 수 있는 Apps Script 템플릿</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">성적 분석 스크립트</h3>
                    <Badge>인기</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Google Sheets에 자동으로 성적 분석 기능을 추가하는 Apps Script
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">출석 자동화 스크립트</h3>
                    <Badge variant="outline">기본</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Google Forms 응답을 자동으로 처리하여 출석부를 업데이트하는 스크립트
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">SMS 알림 스크립트</h3>
                    <Badge variant="outline">고급</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    과제 마감일이 다가오면 미제출 학생에게 SMS 알림을 보내는 스크립트
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    템플릿 사용하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Apps Script 시작하기</CardTitle>
              <CardDescription>단계별 가이드</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      1
                    </div>
                    <h3 className="text-sm font-medium">스크립트 편집기 열기</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Google Sheets에서 '확장 프로그램' &gt; 'Apps Script'를 클릭하세요.
                  </p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      2
                    </div>
                    <h3 className="text-sm font-medium">코드 작성</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    JavaScript 기반 코드를 작성하여 Google 서비스와 상호작용하세요.
                  </p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      3
                    </div>
                    <h3 className="text-sm font-medium">트리거 설정</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    특정 이벤트에 스크립트가 자동으로 실행되도록 트리거를 설정하세요.
                  </p>
                </div>

                <div className="space-y-2 border rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                      4
                    </div>
                    <h3 className="text-sm font-medium">테스트 및 배포</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    스크립트를 테스트하고 필요한 경우 웹 앱으로 배포하세요.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <a href="/dashboard/apps-script">자세한 가이드 보기</a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>학부모 커뮤니케이션 자동화</CardTitle>
          <CardDescription>학부모와의 소통을 자동화하는 방법</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 border rounded-md p-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium">이메일 알림</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                과제 제출, 시험 결과, 출석 상황 등에 대한 자동 이메일 알림을 설정하세요.
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>구현 난이도:</span>
                  <span className="font-medium text-green-600">쉬움</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>추천 도구:</span>
                  <span>Google Apps Script, Power Automate</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border rounded-md p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-medium">SMS 알림</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                중요한 알림이나 긴급 상황에 대해 SMS를 통해 학부모에게 즉시 알림을 보내세요.
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>구현 난이도:</span>
                  <span className="font-medium text-yellow-600">중간</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>추천 도구:</span>
                  <span>Twilio + Zapier, 누리고 API</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border rounded-md p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <h3 className="text-sm font-medium">자동 리포트</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                주간 또는 월간 학생 진도 및 성적 리포트를 자동으로 생성하여 학부모에게 전송하세요.
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>구현 난이도:</span>
                  <span className="font-medium text-red-600">어려움</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>추천 도구:</span>
                  <span>Google Apps Script, Power Automate</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">커뮤니케이션 자동화 가이드 보기</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
