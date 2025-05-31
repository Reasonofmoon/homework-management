import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Link from "next/link"

export function TutorialContent() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300">Reason of Moon</h2>
        <p className="mt-1">
          <Link href="https://litt.ly/reasonofmoon" className="text-blue-600 dark:text-blue-400 underline">
            https://litt.ly/reasonofmoon
          </Link>
        </p>
      </div>

      <Tabs defaultValue="prerequisites" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="prerequisites">시작하기 전에</TabsTrigger>
          <TabsTrigger value="setup">애플리케이션 설정</TabsTrigger>
          <TabsTrigger value="usage">사용 방법</TabsTrigger>
          <TabsTrigger value="troubleshooting">문제 해결</TabsTrigger>
          <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
        </TabsList>

        <TabsContent value="prerequisites" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>필요한 준비물</CardTitle>
              <CardDescription>시작하기 전에 다음 항목이 필요합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <ul className="list-disc pl-5 space-y-2">
                <li>Google 계정</li>
                <li>인터넷 연결</li>
                <li>웹 브라우저 (Chrome, Firefox, Safari 등)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google 시트 준비하기</CardTitle>
              <CardDescription>학생 숙제 관리 시스템을 사용하기 위한 Google 시트 설정 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. Google 시트 생성하기</h3>
                <p>
                  Google Drive에 로그인한 후 '새로 만들기' 버튼을 클릭하고 'Google 스프레드시트'를 선택합니다. 새 시트가
                  생성되면 상단에 제목을 입력하여 시트 이름을 지정할 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. 학생 정보 입력 형식</h3>
                <p>Google 시트는 다음과 같은 열을 포함해야 합니다:</p>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                    <thead>
                      <tr className="bg-blue-50 dark:bg-blue-900">
                        <th className="border border-gray-300 dark:border-gray-700 p-2">학생 이름</th>
                        <th className="border border-gray-300 dark:border-gray-700 p-2">반</th>
                        <th className="border border-gray-300 dark:border-gray-700 p-2">상태</th>
                        <th className="border border-gray-300 dark:border-gray-700 p-2">이메일(선택)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">김온유</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">A반</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">활성</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">student1@example.com</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">김석준</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">A반</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">활성</td>
                        <td className="border border-gray-300 dark:border-gray-700 p-2">student2@example.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm font-medium mt-2 text-blue-700 dark:text-blue-300">
                  중요: 첫 번째 행은 반드시 열 제목으로 사용되어야 합니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. 시트 공유 설정</h3>
                <p>
                  시트의 오른쪽 상단에 있는 '공유' 버튼을 클릭하고 '링크가 있는 모든 사용자'를 선택한 후 권한을 '뷰어'로
                  설정합니다. 이렇게 하면 애플리케이션이 시트 데이터를 읽을 수 있게 됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">4. 시트 ID 확인하기</h3>
                <p>Google 시트의 URL에서 시트 ID를 확인할 수 있습니다. URL은 다음과 같은 형식을 가집니다:</p>
                <code className="block bg-blue-50 dark:bg-blue-900 p-2 rounded">
                  https://docs.google.com/spreadsheets/d/[여기가_시트_ID]/edit
                </code>
                <p>
                  이 ID는 애플리케이션 설정 시 필요합니다. URL에서 '/d/' 다음과 '/edit' 이전의 문자열이 시트 ID입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>애플리케이션 접속하기</CardTitle>
              <CardDescription>학생 숙제 관리 시스템에 접속하는 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                웹 브라우저를 열고 학생 숙제 관리 시스템 URL로 이동한 후, Google 계정으로 로그인합니다. 로그인 후에는
                대시보드 화면이 표시되며, 여기서 학생 관리, 숙제 관리 등 다양한 기능에 접근할 수 있습니다.
              </p>
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                참고: 처음 로그인할 때는 Google 계정 접근 권한을 요청하는 화면이 나타날 수 있습니다. '허용'을 클릭하여
                계속 진행하세요.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google 시트 연동하기</CardTitle>
              <CardDescription>학생 데이터를 가져오기 위한 Google 시트 연동 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">1. 학생 관리 페이지로 이동</h3>
                <p>
                  상단 메뉴에서 '학생 관리'를 클릭합니다. 이 페이지에서는 학생 목록을 확인하고, 새 학생을 추가하거나,
                  Google 시트에서 학생 데이터를 가져올 수 있습니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">2. Google 시트 가져오기</h3>
                <p>
                  '구글 시트 가져오기' 버튼을 클릭한 후, 팝업 창에서 '구글 시트 URL' 탭을 선택하고 앞서 준비한 Google
                  시트의 URL을 입력합니다. URL 전체를 복사하여 붙여넣거나, 시트 ID만 입력해도 됩니다.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">3. 권한 부여하기</h3>
                <p>
                  Google 계정 권한 요청 창이 나타나면 '허용'을 클릭하고, 데이터 가져오기가 완료될 때까지 기다립니다. 이
                  과정은 처음 연동할 때만 필요하며, 이후에는 자동으로 진행됩니다.
                </p>
                <p className="font-medium text-green-600 dark:text-green-400">
                  성공 메시지: "학생 데이터를 성공적으로 가져왔습니다."가 표시되면 설정이 완료된 것입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>대시보드 살펴보기</CardTitle>
              <CardDescription>대시보드에서 제공하는 정보 알아보기</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                대시보드는 학생 숙제 관리 시스템의 핵심 정보를 한눈에 볼 수 있는 페이지입니다. 다음과 같은 정보를
                제공합니다:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">전체 학생 수</span>: 시스템에 등록된 총
                  학생 수와 변동 추이
                </li>
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">활성 숙제</span>: 현재 진행 중인 숙제의
                  수와 이번 주 마감되는 숙제 수
                </li>
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">평균 완료율</span>: 학생들의 숙제 평균
                  완료율과 변동 추이
                </li>
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">다가오는 마감일</span>: 가장 가까운
                  숙제 마감일까지 남은 일수
                </li>
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">최근 등록된 숙제</span>: 최근에
                  시스템에 추가된 숙제 목록
                </li>
                <li>
                  <span className="font-medium text-blue-700 dark:text-blue-300">학생별 진행 상황</span>: 각 학생의 숙제
                  완료 현황을 그래프로 표시
                </li>
              </ul>
              <p className="mt-4">
                대시보드는 실시간으로 업데이트되며, 학생들의 숙제 진행 상황을 효과적으로 모니터링할 수 있습니다. 각
                카드의 정보를 클릭하면 더 자세한 내용을 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="students">
              <AccordionTrigger className="text-lg font-medium">학생 관리하기</AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">학생 추가하기</h3>
                  <p>
                    '학생 관리' 페이지에서 '학생 추가' 버튼을 클릭한 후, 팝업 창에 학생 정보를 입력하고 '추가' 버튼을
                    클릭합니다. 필수 입력 항목은 이름과 반입니다. 학생을 추가하면 즉시 목록에 표시되며, 해당 학생에게
                    숙제를 할당할 수 있게 됩니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">학생 정보 수정하기</h3>
                  <p>
                    학생 목록에서 수정할 학생의 행 끝에 있는 메뉴 버튼(⋯)을 클릭하고 '학생 정보 수정'을 선택한 후,
                    정보를 수정하고 '저장'을 클릭합니다. 학생의 이름, 반, 상태 등을 변경할 수 있으며, 상태를
                    '비활성'으로 변경하면 해당 학생은 숙제 할당 목록에서 제외됩니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">학생 삭제하기</h3>
                  <p>
                    학생 목록에서 삭제할 학생의 행 끝에 있는 메뉴 버튼(⋯)을 클릭하고 '학생 삭제'를 선택한 후, 확인
                    메시지가 나타나면 '삭제'를 클릭합니다. 삭제된 학생은 복구할 수 없으므로 신중하게 결정해야 합니다.
                    학생을 완전히 삭제하는 대신 상태를 '비활성'으로 변경하는 것이 권장됩니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="assignments">
              <AccordionTrigger className="text-lg font-medium">숙제 관리하기</AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">개별 숙제 추가하기</h3>
                  <p>
                    '숙제 관리' 페이지에서 '숙제 추가' 탭을 클릭한 후, 필요한 정보를 입력하고 '숙제 추가' 버튼을
                    클릭합니다. 숙제 제목, 설명, 마감일, 할당할 학생을 지정할 수 있습니다. 학생은 개별적으로 선택하거나
                    반 단위로 선택할 수 있으며, '전체 학생'을 선택하면 모든 활성 학생에게 숙제가 할당됩니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">일괄 숙제 추가하기</h3>
                  <p>
                    '숙제 관리' 페이지에서 '일괄 추가' 탭을 클릭한 후, 텍스트 영역에 각 줄마다 하나의 숙제를 입력하고
                    마감일과 학생을 선택한 후 '일괄 추가' 버튼을 클릭합니다. 이 기능은 여러 숙제를 한 번에 추가할 때
                    유용합니다. 모든 숙제는 동일한 마감일과 학생 할당을 가지게 됩니다.
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">예시 입력 형식:</p>
                  <pre className="bg-blue-50 dark:bg-blue-900 p-2 rounded text-sm">
                    Dragon Masters 5권 챕터 1-5 읽기{"\n"}
                    퀴즐릿 연습{"\n"}
                    어휘 501-525{"\n"}
                    소리 모닝 91-100
                  </pre>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">숙제 복제하기</h3>
                  <p>
                    '숙제 목록' 탭에서 복제할 숙제를 찾아 숙제 카드 하단의 '복제' 버튼을 클릭한 후, 필요에 따라 정보를
                    수정하고 '저장'을 클릭합니다. 이 기능은 유사한 숙제를 반복적으로 추가할 때 유용합니다. 복제된 숙제는
                    원본 숙제의 모든 정보를 가져오지만, 마감일과 할당 대상은 수정할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">숙제 삭제하기</h3>
                  <p>
                    '숙제 목록' 탭에서 삭제할 숙제를 찾아 숙제 카드 하단의 '삭제' 버튼을 클릭한 후, 확인 메시지가
                    나타나면 '삭제'를 클릭합니다. 삭제된 숙제는 복구할 수 없으므로 신중하게 결정해야 합니다. 숙제 상태를
                    '완료'로 변경하는 것이 삭제보다 권장됩니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="calendar">
              <AccordionTrigger className="text-lg font-medium">캘린더 사용하기</AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">날짜별 숙제 확인하기</h3>
                  <p>
                    '캘린더' 페이지로 이동한 후, 캘린더에서 확인하고 싶은 날짜를 클릭하면 오른쪽 패널에 해당 날짜의 모든
                    숙제가 표시됩니다. 캘린더에서 숙제가 있는 날짜는 강조 표시되며, 숫자 배지로 해당 날짜의 숙제 수를
                    확인할 수 있습니다.
                  </p>
                  <p>
                    오른쪽 패널에서는 선택한 날짜의 숙제 목록을 확인할 수 있으며, 각 숙제의 제목, 설명, 할당된 학생 등의
                    정보를 볼 수 있습니다. 이 정보를 통해 특정 날짜에 어떤 숙제가 마감되는지 한눈에 파악할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">캘린더 탐색하기</h3>
                  <p>
                    캘린더 상단의 화살표 버튼을 사용하여 월을 이동할 수 있습니다. 현재 월로 빠르게 돌아가려면 월 이름을
                    클릭하세요. 캘린더는 기본적으로 현재 월을 표시하며, 날짜를 클릭하여 해당 날짜의 숙제를 확인할 수
                    있습니다.
                  </p>
                  <p>
                    캘린더 보기는 숙제 마감일을 시각적으로 관리하는 데 매우 유용합니다. 특히 여러 학생과 다양한 숙제를
                    관리할 때 일정을 효과적으로 계획하는 데 도움이 됩니다.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips">
              <AccordionTrigger className="text-lg font-medium">맞춤 설정 팁</AccordionTrigger>
              <AccordionContent className="space-y-4 p-4">
                <div className="space-y-2">
                  <h3 className="text-md font-medium">반 구성 최적화</h3>
                  <p>
                    학생들을 효과적으로 그룹화하기 위해 반을 적절히 구성하세요. 예: 수준별, 나이별, 또는 과목별로 반을
                    구성할 수 있습니다. 반 구성은 숙제를 할당할 때 특히 유용합니다. 반 이름은 자유롭게 지정할 수 있으며,
                    학생 관리 페이지에서 학생을 추가하거나 수정할 때 반을 지정할 수 있습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">숙제 템플릿 활용</h3>
                  <p>
                    자주 사용하는 숙제는 템플릿처럼 활용할 수 있습니다. 기존 숙제를 복제한 후 필요한 부분만 수정하여
                    시간을 절약하세요. 예를 들어, 매주 반복되는 읽기 숙제나 단어 학습 숙제는 한 번 만들어 놓고 복제하여
                    마감일만 변경하면 됩니다. 이렇게 하면 매번 새로운 숙제를 처음부터 만들 필요가 없습니다.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">다크 모드 사용</h3>
                  <p>
                    화면 오른쪽 상단의 테마 전환 버튼을 클릭하고 '다크'를 선택하여 눈의 피로를 줄이고 야간 작업 시
                    편안함을 높이세요. 다크 모드는 특히 저녁이나 밤에 시스템을 사용할 때 눈의 피로를 줄이는 데 도움이
                    됩니다. 시스템 설정에 따라 자동으로 테마를 전환하려면 '시스템' 옵션을 선택하세요.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-medium">정기적인 데이터 백업</h3>
                  <p>
                    중요한 학생 및 숙제 데이터는 정기적으로 백업하는 것이 좋습니다. Google 시트를 통해 학생 데이터를
                    관리하면 자동으로 백업되지만, 시스템 내에서 생성한 숙제 데이터는 별도로 백업해야 합니다. 중요한
                    변경사항이 있을 때마다 데이터를 내보내기 기능을 사용하여 백업하세요.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>구글 시트 가져오기 오류</CardTitle>
              <CardDescription>구글 시트 가져오기 관련 문제 해결 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: "유효한 구글 시트 URL이 아닙니다."</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    URL이 올바른 형식인지 확인하세요: <code>https://docs.google.com/spreadsheets/d/[시트_ID]/edit</code>
                  </li>
                  <li>시트가 '링크가 있는 모든 사용자'에게 공유되어 있는지 확인하세요.</li>
                  <li>URL에서 불필요한 매개변수를 제거하고 기본 URL만 사용해 보세요.</li>
                  <li>브라우저에서 시트에 직접 접근할 수 있는지 확인하세요.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: "권한이 없습니다."</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>구글 계정으로 로그인되어 있는지 확인하세요.</li>
                  <li>시트의 소유자에게 접근 권한을 요청하세요.</li>
                  <li>
                    시트 공유 설정에서 '링크가 있는 모든 사용자'에게 최소한 '뷰어' 권한이 부여되어 있는지 확인하세요.
                  </li>
                  <li>다른 구글 계정으로 로그인되어 있다면, 시트에 접근 권한이 있는 계정으로 전환하세요.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: "데이터 형식이 올바르지 않습니다."</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>시트의 첫 번째 행이 열 제목으로 사용되고 있는지 확인하세요.</li>
                  <li>필수 열(학생 이름, 반, 상태)이 모두 포함되어 있는지 확인하세요.</li>
                  <li>데이터 셀에 특수 문자나 서식이 포함되어 있지 않은지 확인하세요.</li>
                  <li>
                    시트의 데이터가 첫 번째 시트(Sheet1)에 있는지 확인하세요. 시스템은 기본적으로 첫 번째 시트만
                    읽습니다.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>데이터 동기화 문제</CardTitle>
              <CardDescription>데이터 동기화 관련 문제 해결 방법</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: 구글 시트의 변경사항이 앱에 반영되지 않음</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    '학생 관리' 페이지에서 '구글 시트 가져오기'를 다시 실행하세요. 시스템은 자동으로 변경사항을 감지하지
                    않으므로, 구글 시트를 수정한 후에는 항상 데이터를 다시 가져와야 합니다.
                  </li>
                  <li>
                    브라우저 캐시를 지우고 페이지를 새로고침하세요. 때로는 브라우저 캐시가 최신 데이터를 표시하지 않을
                    수 있습니다.
                  </li>
                  <li>
                    구글 시트의 변경사항이 저장되었는지 확인하세요. 구글 시트는 자동 저장되지만, 인터넷 연결 문제로
                    변경사항이 저장되지 않을 수 있습니다.
                  </li>
                  <li>다른 사용자가 동시에 시트를 편집하고 있는지 확인하세요. 충돌이 발생할 수 있습니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>기타 일반적인 문제</CardTitle>
              <CardDescription>기타 자주 발생하는 문제 해결 방법</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: 페이지가 로드되지 않음</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>인터넷 연결을 확인하세요. 안정적인 인터넷 연결이 필요합니다.</li>
                  <li>
                    브라우저 캐시를 지우고 다시 시도하세요. 메뉴 {">"} 설정 {">"} 개인정보 및 보안 {">"} 인터넷 사용
                    기록 삭제에서 캐시를 지울 수 있습니다.
                  </li>
                  <li>다른 브라우저로 시도하세요. 일부 브라우저 확장 프로그램이 페이지 로드를 방해할 수 있습니다.</li>
                  <li>방화벽이나 보안 소프트웨어가 접근을 차단하고 있지 않은지 확인하세요.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: 변경사항이 저장되지 않음</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>변경 전에 저장 버튼을 클릭했는지 확인하세요. 일부 변경사항은 자동으로 저장되지 않습니다.</li>
                  <li>
                    브라우저의 로컬 스토리지가 가득 차지 않았는지 확인하세요. 브라우저 설정에서 사이트 데이터를 확인할
                    수 있습니다.
                  </li>
                  <li>
                    브라우저의 개인정보 보호 모드나 시크릿 모드를 사용 중이라면, 일반 모드로 전환하세요. 개인정보 보호
                    모드에서는 데이터가 세션이 끝나면 삭제됩니다.
                  </li>
                  <li>브라우저 확장 프로그램이 로컬 스토리지 접근을 차단하고 있지 않은지 확인하세요.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">문제: 인터페이스가 제대로 표시되지 않음</h3>
                <p className="font-bold text-blue-700 dark:text-blue-300">해결 방법:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    브라우저를 최신 버전으로 업데이트하세요. 오래된 브라우저는 최신 웹 기술을 지원하지 않을 수 있습니다.
                  </li>
                  <li>
                    화면 크기를 조정하거나 확대/축소 수준을 조정해 보세요. 일부 요소는 특정 화면 크기에서 최적화되어
                    있습니다.
                  </li>
                  <li>
                    다크 모드와 라이트 모드를 전환해 보세요. 때로는 테마 전환이 인터페이스 문제를 해결할 수 있습니다.
                  </li>
                  <li>브라우저의 하드웨어 가속 기능을 비활성화해 보세요. 그래픽 관련 문제가 발생할 수 있습니다.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>자주 묻는 질문</CardTitle>
              <CardDescription>사용자들이 자주 묻는 질문과 답변</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>한 번에 얼마나 많은 학생을 관리할 수 있나요?</AccordionTrigger>
                  <AccordionContent>
                    시스템은 수백 명의 학생을 효율적으로 관리할 수 있도록 설계되었습니다. 그러나 최적의 성능을 위해
                    반별로 30-40명 이내로 유지하는 것이 좋습니다. 학생 수가 많을 경우, 반을 여러 개로 나누어 관리하면 더
                    효율적입니다. 시스템의 성능은 사용 중인 기기의 사양과 인터넷 연결 속도에 따라 달라질 수 있습니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>구글 시트 데이터가 자동으로 동기화되나요?</AccordionTrigger>
                  <AccordionContent>
                    아니요, 변경사항을 반영하려면 '구글 시트 가져오기' 기능을 다시 실행해야 합니다. 시스템은 실시간
                    동기화를 지원하지 않으며, 구글 시트의 데이터를 수동으로 가져와야 합니다. 이는 불필요한 데이터 전송을
                    방지하고 시스템 성능을 최적화하기 위한 설계입니다. 정기적으로 데이터를 업데이트하는 습관을 들이는
                    것이 좋습니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>학생들도 이 시스템에 접근할 수 있나요?</AccordionTrigger>
                  <AccordionContent>
                    현재 버전은 관리자용으로 설계되었습니다. 학생용 접근 기능은 향후 업데이트에서 추가될 예정입니다.
                    현재로서는 관리자가 학생들에게 숙제 정보를 별도로 공유해야 합니다. 향후 업데이트에서는 학생들이
                    자신의 숙제를 확인하고 완료 상태를 업데이트할 수 있는 기능이 추가될 예정입니다. 업데이트 소식은 공식
                    채널을 통해 안내될 것입니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>데이터는 어디에 저장되나요?</AccordionTrigger>
                  <AccordionContent>
                    기본 학생 정보는 구글 시트에 저장되며, 숙제 및 진행 상황 데이터는 애플리케이션의 로컬 스토리지에
                    저장됩니다. 로컬 스토리지는 브라우저에 저장되는 데이터로, 기기를 변경하거나 브라우저 데이터를 지우면
                    손실될 수 있습니다. 중요한 데이터는 정기적으로 백업하는 것이 좋습니다. 향후 업데이트에서는 클라우드
                    기반 데이터 저장 옵션이 추가될 예정입니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>다른 기기에서도 동일한 데이터에 접근할 수 있나요?</AccordionTrigger>
                  <AccordionContent>
                    네, 같은 구글 계정으로 로그인하면 학생 데이터에 접근할 수 있습니다. 그러나 숙제 데이터는 기기별로
                    저장되므로, 주 사용 기기를 지정하는 것이 좋습니다. 여러 기기에서 작업해야 하는 경우, 데이터
                    내보내기/가져오기 기능을 사용하여 데이터를 동기화할 수 있습니다. 이 기능은 설정 메뉴에서 찾을 수
                    있습니다. 향후 업데이트에서는 기기 간 자동 동기화 기능이 추가될 예정입니다.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-6">
                  <AccordionTrigger>시스템 사용에 특별한 기술이 필요한가요?</AccordionTrigger>
                  <AccordionContent>
                    아니요, 시스템은 사용자 친화적으로 설계되었으며 특별한 기술 지식 없이도 쉽게 사용할 수 있습니다.
                    기본적인 컴퓨터 사용 능력과 구글 시트에 대한 기본 지식만 있으면 충분합니다. 이 튜토리얼은 시스템
                    사용에 필요한 모든 정보를 제공합니다. 추가 질문이 있으면 지원 팀에 문의하세요. 시스템은 지속적으로
                    개선되고 있으며, 사용자 피드백을 반영하여 더 직관적인 인터페이스로 업데이트됩니다.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">Reason of Moon</h3>
        <p className="text-sm">효율적인 학습 관리를 위한 최고의 선택</p>
        <p className="mt-1">
          <Link href="https://litt.ly/reasonofmoon" className="text-blue-600 dark:text-blue-400 underline">
            https://litt.ly/reasonofmoon
          </Link>
        </p>
        <p className="text-xs mt-4">© 2025 Reason of Moon. All rights reserved.</p>
      </div>
    </div>
  )
}

// Make sure we have a default export as well
export default TutorialContent
