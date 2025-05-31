"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Copy, Check, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function AppsScriptEditor() {
  const [activeTab, setActiveTab] = useState("grade-analysis")
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const scripts = {
    "grade-analysis": {
      name: "성적 분석 스크립트",
      description: "Google Sheets에 자동으로 성적 분석 기능을 추가하는 Apps Script",
      code: `function analyzeTotalScore() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // 헤더 건너뛰기
  const scores = data.slice(1).map(row => row[3]); // 4번째 열이 점수라고 가정
  
  // 평균, 최고점, 최저점 계산
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  
  // 결과 셀에 출력
  sheet.getRange("J1").setValue("평균점수");
  sheet.getRange("J2").setValue(average);
  sheet.getRange("K1").setValue("최고점");
  sheet.getRange("K2").setValue(max);
  sheet.getRange("L1").setValue("최저점");
  sheet.getRange("L2").setValue(min);
}`,
      instructions: [
        "Google Sheets 문서를 엽니다.",
        "상단 메뉴에서 '확장 프로그램' > 'Apps Script'를 클릭합니다.",
        "열린 Apps Script 편집기에 위 코드를 붙여넣습니다.",
        "저장 후 실행하여 성적을 분석합니다.",
      ],
    },
    attendance: {
      name: "출석 자동화 스크립트",
      description: "Google Forms 응답을 자동으로 처리하여 출석부를 업데이트하는 스크립트",
      code: `function processAttendance() {
  // 출석 폼 응답이 저장된 스프레드시트
  const formSheet = SpreadsheetApp.openById('YOUR_FORM_RESPONSE_SHEET_ID').getSheetByName('응답 시트1');
  // 출석부 스프레드시트
  const attendanceSheet = SpreadsheetApp.openById('YOUR_ATTENDANCE_SHEET_ID').getSheetByName('출석부');
  
  // 폼 응답 데이터 가져오기
  const formData = formSheet.getDataRange().getValues();
  // 헤더 제외
  const responses = formData.slice(1);
  
  // 출석부 데이터 가져오기
  const attendanceData = attendanceSheet.getDataRange().getValues();
  const headerRow = attendanceData[0];
  
  // 오늘 날짜 열 찾기 또는 추가하기
  const today = new Date();
  const dateString = Utilities.formatDate(today, 'Asia/Seoul', 'yyyy-MM-dd');
  let dateColumnIndex = headerRow.indexOf(dateString);
  
  if (dateColumnIndex === -1) {
    // 새 날짜 열 추가
    dateColumnIndex = headerRow.length;
    attendanceSheet.getRange(1, dateColumnIndex + 1).setValue(dateString);
  }
  
  // 각 응답 처리
  responses.forEach(response => {
    const timestamp = response[0]; // 타임스탬프
    const studentName = response[1]; // 학생 이름
    const status = response[2]; // 출석 상태 (출석, 지각, 결석 등)
    
    // 학생 이름으로 출석부에서 행 찾기
    for (let i = 1; i < attendanceData.length; i++) {
      if (attendanceData[i][0] === studentName) {
        // 출석 상태 업데이트
        attendanceSheet.getRange(i + 1, dateColumnIndex + 1).setValue(status);
        break;
      }
    }
  });
}`,
      instructions: [
        "Google Forms로 출석 체크 폼을 만듭니다.",
        "폼 응답이 저장되는 스프레드시트 ID를 확인합니다.",
        "출석부 스프레드시트를 만들고 ID를 확인합니다.",
        "코드에서 'YOUR_FORM_RESPONSE_SHEET_ID'와 'YOUR_ATTENDANCE_SHEET_ID'를 실제 ID로 변경합니다.",
        "Apps Script 편집기에 코드를 붙여넣고 저장합니다.",
        "트리거를 설정하여 폼 제출 시 자동으로 실행되도록 합니다.",
      ],
    },
    "sms-notification": {
      name: "SMS 알림 스크립트",
      description: "과제 마감일이 다가오면 미제출 학생에게 SMS 알림을 보내는 스크립트",
      code: `function sendSMSReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("학생정보");
  const data = sheet.getDataRange().getValues();
  
  // 헤더 건너뛰기
  for (let i = 1; i < data.length; i++) {
    const studentName = data[i][0];
    const parentPhone = data[i][2];
    const assignmentStatus = data[i][5];
    
    if (assignmentStatus === "미제출") {
      // Twilio API 호출 코드
      const twilioAccountSid = 'YOUR_TWILIO_ACCOUNT_SID';
      const twilioAuthToken = 'YOUR_TWILIO_AUTH_TOKEN';
      const twilioPhoneNumber = 'YOUR_TWILIO_PHONE_NUMBER';
      
      const message = \`[\${studentName}] 학생의 과제가 미제출 상태입니다. 마감일이 다가오니 확인 부탁드립니다.\`;
      
      const payload = {
        'To': parentPhone,
        'From': twilioPhoneNumber,
        'Body': message
      };
      
      const options = {
        'method': 'post',
        'payload': payload,
        'headers': {
          'Authorization': 'Basic ' + Utilities.base64Encode(twilioAccountSid + ':' + twilioAuthToken)
        }
      };
      
      try {
        UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/' + twilioAccountSid + '/Messages.json', options);
        Logger.log(\`\${studentName}의 학부모에게 과제 미제출 알림 전송 성공\`);
      } catch (e) {
        Logger.log(\`\${studentName}의 학부모에게 알림 전송 실패: \${e.message}\`);
      }
    }
  }
}`,
      instructions: [
        "Twilio 계정을 생성하고 계정 SID와 인증 토큰을 확인합니다.",
        "Twilio에서 전화번호를 구매합니다.",
        "코드에서 'YOUR_TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_AUTH_TOKEN', 'YOUR_TWILIO_PHONE_NUMBER'를 실제 값으로 변경합니다.",
        "학생 정보 스프레드시트에 학생 이름, 학부모 전화번호, 과제 상태 열이 있는지 확인합니다.",
        "Apps Script 편집기에 코드를 붙여넣고 저장합니다.",
        "트리거를 설정하여 매일 또는 특정 시간에 실행되도록 합니다.",
      ],
    },
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(scripts[activeTab].code)
    setCopied(true)
    toast({
      title: "코드가 복사되었습니다",
      description: "Apps Script 편집기에 붙여넣을 수 있습니다.",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Apps Script 코드</CardTitle>
        <CardDescription>교육 업무 자동화를 위한 Google Apps Script 코드 예제</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grade-analysis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="grade-analysis">성적 분석</TabsTrigger>
            <TabsTrigger value="attendance">출석 자동화</TabsTrigger>
            <TabsTrigger value="sms-notification">SMS 알림</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium">{scripts[activeTab].name}</h3>
              <p className="text-sm text-muted-foreground">{scripts[activeTab].description}</p>
            </div>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">{scripts[activeTab].code}</pre>
              <Button size="sm" variant="ghost" className="absolute top-2 right-2" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">사용 방법</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                {scripts[activeTab].instructions.map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                스크립트를 실행하기 전에 반드시 백업을 만들고, 코드를 이해한 후 사용하세요.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <a
          href="https://script.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center"
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Google Apps Script 열기
        </a>
        <Button onClick={handleCopy}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          코드 복사
        </Button>
      </CardFooter>
    </Card>
  )
}
