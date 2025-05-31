"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink, RefreshCw, AlertCircle, Link2, FileSpreadsheet, Bot, Loader2 } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import type { IntegrationConfig } from "@/lib/types"
import { fetchStudentsFromSheet } from "@/lib/google-sheets"
import { createAttendanceForm, createAssignmentSubmissionForm } from "@/lib/google-forms"

const defaultConfig: IntegrationConfig = {
  googleSheets: {
    connected: false,
    sheetId: "",
    lastSync: "",
  },
  googleForms: {
    connected: false,
    formIds: [],
  },
  powerAutomate: {
    connected: false,
    flows: [],
  },
  zapier: {
    connected: false,
    zaps: [],
  },
}

export function IntegrationStatus() {
  const [config, setConfig] = useLocalStorage<IntegrationConfig>("integration-config", defaultConfig)
  const [showGoogleSheetsDialog, setShowGoogleSheetsDialog] = useState(false)
  const [newSheetId, setNewSheetId] = useState(config.googleSheets.sheetId || "")
  const [showGoogleFormsDialog, setShowGoogleFormsDialog] = useState(false)
  const [newFormId, setNewFormId] = useState("")
  const [showPowerAutomateDialog, setShowPowerAutomateDialog] = useState(false)
  const [newFlowName, setNewFlowName] = useState("")
  const [showZapierDialog, setShowZapierDialog] = useState(false)
  const [newZapName, setNewZapName] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isCreatingForm, setIsCreatingForm] = useState(false)
  const { toast } = useToast()

  // 학생 데이터 가져오기
  const [students, setStudents] = useLocalStorage<any[]>("students", [])

  const handleRefresh = async () => {
    setIsRefreshing(true)

    try {
      // Google Sheets 연결 확인
      if (config.googleSheets.connected && config.googleSheets.sheetId) {
        await syncGoogleSheets()
      }

      // 다른 서비스 연결 확인 로직 추가

      toast({
        title: "새로고침 완료",
        description: "모든 통합 서비스 상태가 업데이트되었습니다.",
      })
    } catch (error) {
      console.error("새로고침 중 오류 발생:", error)
      toast({
        title: "새로고침 실패",
        description: "통합 서비스 상태를 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const syncGoogleSheets = async () => {
    if (!config.googleSheets.sheetId) return

    setIsSyncing(true)

    try {
      // Google Sheets에서 학생 데이터 가져오기
      const fetchedStudents = await fetchStudentsFromSheet(config.googleSheets.sheetId)

      // 기존 학생 데이터와 병합
      const existingStudents = students || []
      const mergedStudents = [...existingStudents]

      fetchedStudents.forEach((newStudent) => {
        const existingIndex = mergedStudents.findIndex(
          (s) => s.name === newStudent.name && s.group === newStudent.group,
        )

        if (existingIndex >= 0) {
          // 기존 학생 정보 업데이트
          mergedStudents[existingIndex] = {
            ...mergedStudents[existingIndex],
            status: newStudent.status,
            email: newStudent.email || mergedStudents[existingIndex].email,
            parentEmail: newStudent.parentEmail || mergedStudents[existingIndex].parentEmail,
            parentPhone: newStudent.parentPhone || mergedStudents[existingIndex].parentPhone,
            updatedAt: new Date().toISOString(),
          }
        } else {
          // 새 학생 추가
          mergedStudents.push({
            ...newStudent,
            id: (mergedStudents.length + 1).toString(), // 임시 ID 생성
          })
        }
      })

      // 학생 데이터 업데이트
      setStudents(mergedStudents)

      // 통합 설정 업데이트
      setConfig({
        ...config,
        googleSheets: {
          ...config.googleSheets,
          lastSync: new Date().toISOString(),
        },
      })

      toast({
        title: "동기화 완료",
        description: `${fetchedStudents.length}명의 학생 데이터를 성공적으로 가져왔습니다.`,
      })
    } catch (error) {
      console.error("Google Sheets 동기화 중 오류 발생:", error)
      toast({
        title: "동기화 실패",
        description: "Google Sheets에서 데이터를 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const connectGoogleSheets = async () => {
    if (!newSheetId.trim()) return

    setIsSyncing(true)

    try {
      // Google Sheets 연결 테스트
      await fetchStudentsFromSheet(newSheetId)

      // 연결 성공 시 설정 업데이트
      setConfig({
        ...config,
        googleSheets: {
          connected: true,
          sheetId: newSheetId,
          lastSync: new Date().toISOString(),
        },
      })

      // 학생 데이터 동기화
      await syncGoogleSheets()

      setShowGoogleSheetsDialog(false)

      toast({
        title: "Google Sheets 연결 성공",
        description: "Google Sheets가 성공적으로 연결되었습니다.",
      })
    } catch (error) {
      console.error("Google Sheets 연결 중 오류 발생:", error)
      toast({
        title: "Google Sheets 연결 실패",
        description: "Google Sheets에 연결하는 중 오류가 발생했습니다. 스프레드시트 ID와 권한을 확인하세요.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const createForm = async (formType: string) => {
    if (!students || students.length === 0) {
      toast({
        title: "폼 생성 실패",
        description: "학생 데이터가 없습니다. 먼저 학생 데이터를 가져오세요.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingForm(true)

    try {
      let formId = ""
      const studentNames = students.filter((s) => s.status === "active").map((s) => s.name)

      if (formType === "attendance") {
        // 출석 체크 폼 생성
        const className = "전체 학생" // 실제 구현에서는 선택한 반 이름 사용
        formId = await createAttendanceForm(className, studentNames)
      } else if (formType === "assignment") {
        // 과제 제출 폼 생성
        const assignmentTitle = "새 과제" // 실제 구현에서는 입력한 과제 제목 사용
        formId = await createAssignmentSubmissionForm(assignmentTitle, studentNames)
      } else {
        throw new Error("지원하지 않는 폼 유형입니다.")
      }

      // 폼 ID 추가
      setConfig({
        ...config,
        googleForms: {
          connected: true,
          formIds: [...config.googleForms.formIds, formId],
        },
      })

      setNewFormId("")
      setShowGoogleFormsDialog(false)

      toast({
        title: "Google Form 생성 성공",
        description: "Google Form이 성공적으로 생성되었습니다.",
      })
    } catch (error) {
      console.error("Google Form 생성 중 오류 발생:", error)
      toast({
        title: "Google Form 생성 실패",
        description: "Google Form을 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingForm(false)
    }
  }

  const addGoogleForm = () => {
    if (!newFormId.trim()) return

    setConfig({
      ...config,
      googleForms: {
        ...config.googleForms,
        connected: true,
        formIds: [...config.googleForms.formIds, newFormId],
      },
    })

    setNewFormId("")
    setShowGoogleFormsDialog(false)

    toast({
      title: "Google Form 추가 완료",
      description: "Google Form이 성공적으로 추가되었습니다.",
    })
  }

  const addPowerAutomateFlow = () => {
    if (!newFlowName.trim()) return

    setConfig({
      ...config,
      powerAutomate: {
        connected: true,
        flows: [
          ...config.powerAutomate.flows,
          {
            name: newFlowName,
            status: "active",
            lastRun: new Date().toISOString(),
          },
        ],
      },
    })

    setNewFlowName("")
    setShowPowerAutomateDialog(false)

    toast({
      title: "Power Automate 플로우 추가 완료",
      description: "Power Automate 플로우가 성공적으로 추가되었습니다.",
    })
  }

  const addZapierZap = () => {
    if (!newZapName.trim()) return

    setConfig({
      ...config,
      zapier: {
        connected: true,
        zaps: [
          ...config.zapier.zaps,
          {
            name: newZapName,
            status: "on",
            lastRun: new Date().toISOString(),
          },
        ],
      },
    })

    setNewZapName("")
    setShowZapierDialog(false)

    toast({
      title: "Zapier Zap 추가 완료",
      description: "Zapier Zap이 성공적으로 추가되었습니다.",
    })
  }

  const togglePowerAutomateFlowStatus = (index: number) => {
    const updatedFlows = [...config.powerAutomate.flows]
    updatedFlows[index].status = updatedFlows[index].status === "active" ? "inactive" : "active"

    setConfig({
      ...config,
      powerAutomate: {
        ...config.powerAutomate,
        flows: updatedFlows,
      },
    })

    toast({
      title: "플로우 상태 변경",
      description: `플로우 상태가 '${updatedFlows[index].status === "active" ? "활성" : "비활성"}'으로 변경되었습니다.`,
    })
  }

  const toggleZapierZapStatus = (index: number) => {
    const updatedZaps = [...config.zapier.zaps]
    updatedZaps[index].status = updatedZaps[index].status === "on" ? "off" : "on"

    setConfig({
      ...config,
      zapier: {
        ...config.zapier,
        zaps: updatedZaps,
      },
    })

    toast({
      title: "Zap 상태 변경",
      description: `Zap 상태가 '${updatedZaps[index].status === "on" ? "활성" : "비활성"}'으로 변경되었습니다.`,
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "없음"

    try {
      const date = new Date(dateString)
      return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "날짜 형식 오류"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">통합 서비스 상태</h3>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          새로고침
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Google Sheets 통합 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5 text-green-600" />
                Google Sheets
              </CardTitle>
              <Badge variant={config.googleSheets.connected ? "default" : "outline"}>
                {config.googleSheets.connected ? "연결됨" : "연결 안됨"}
              </Badge>
            </div>
            <CardDescription>학생 데이터 및 성적 관리를 위한 Google Sheets 연동</CardDescription>
          </CardHeader>
          <CardContent>
            {config.googleSheets.connected ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">시트 ID:</span>
                  <span className="font-mono">{config.googleSheets.sheetId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">마지막 동기화:</span>
                  <span>{formatDate(config.googleSheets.lastSync)}</span>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={syncGoogleSheets}
                    disabled={isSyncing}
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        동기화 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        지금 동기화
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Button variant="outline" onClick={() => setShowGoogleSheetsDialog(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Google Sheets 연결하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <a
              href="https://docs.google.com/spreadsheets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Google Sheets 열기
            </a>
            {config.googleSheets.connected && (
              <Button variant="ghost" size="sm" onClick={() => setShowGoogleSheetsDialog(true)}>
                설정 변경
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Google Forms 통합 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <FileSpreadsheet className="mr-2 h-5 w-5 text-purple-600" />
                Google Forms
              </CardTitle>
              <Badge variant={config.googleForms.connected ? "default" : "outline"}>
                {config.googleForms.connected ? "연결됨" : "연결 안됨"}
              </Badge>
            </div>
            <CardDescription>출석, 과제 제출, 시험 등을 위한 Google Forms 연동</CardDescription>
          </CardHeader>
          <CardContent>
            {config.googleForms.connected ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">연결된 폼:</span>
                  <span>{config.googleForms.formIds.length}개</span>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {config.googleForms.formIds.map((formId, index) => (
                    <div key={index} className="text-xs font-mono bg-muted p-1 rounded">
                      {formId}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createForm("attendance")}
                    disabled={isCreatingForm}
                  >
                    {isCreatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    출석 체크 폼 생성
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createForm("assignment")}
                    disabled={isCreatingForm}
                  >
                    {isCreatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    과제 제출 폼 생성
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Button variant="outline" onClick={() => setShowGoogleFormsDialog(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Google Forms 연결하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <a
              href="https://docs.google.com/forms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Google Forms 열기
            </a>
            {config.googleForms.connected && (
              <Button variant="ghost" size="sm" onClick={() => setShowGoogleFormsDialog(true)}>
                폼 추가
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Power Automate 통합 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Bot className="mr-2 h-5 w-5 text-blue-600" />
                Power Automate
              </CardTitle>
              <Badge variant={config.powerAutomate.connected ? "default" : "outline"}>
                {config.powerAutomate.connected ? "연결됨" : "연결 안됨"}
              </Badge>
            </div>
            <CardDescription>자동화된 워크플로우를 위한 Microsoft Power Automate 연동</CardDescription>
          </CardHeader>
          <CardContent>
            {config.powerAutomate.connected ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">등록된 플로우:</span>
                  <span>{config.powerAutomate.flows.length}개</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {config.powerAutomate.flows.map((flow, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                      <div className="flex items-center">
                        <Badge
                          variant={flow.status === "active" ? "default" : "secondary"}
                          className="mr-2 cursor-pointer"
                          onClick={() => togglePowerAutomateFlowStatus(index)}
                        >
                          {flow.status === "active" ? "활성" : "비활성"}
                        </Badge>
                        <span>{flow.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {flow.lastRun ? `마지막 실행: ${formatDate(flow.lastRun)}` : "실행 기록 없음"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Button variant="outline" onClick={() => setShowPowerAutomateDialog(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Power Automate 연결하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <a
              href="https://make.powerautomate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Power Automate 열기
            </a>
            {config.powerAutomate.connected && (
              <Button variant="ghost" size="sm" onClick={() => setShowPowerAutomateDialog(true)}>
                플로우 추가
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Zapier 통합 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Bot className="mr-2 h-5 w-5 text-orange-600" />
                Zapier
              </CardTitle>
              <Badge variant={config.zapier.connected ? "default" : "outline"}>
                {config.zapier.connected ? "연결됨" : "연결 안됨"}
              </Badge>
            </div>
            <CardDescription>다양한 앱과 서비스를 연결하는 Zapier 자동화 연동</CardDescription>
          </CardHeader>
          <CardContent>
            {config.zapier.connected ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">등록된 Zap:</span>
                  <span>{config.zapier.zaps.length}개</span>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {config.zapier.zaps.map((zap, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                      <div className="flex items-center">
                        <Badge
                          variant={zap.status === "on" ? "default" : "secondary"}
                          className="mr-2 cursor-pointer"
                          onClick={() => toggleZapierZapStatus(index)}
                        >
                          {zap.status === "on" ? "활성" : "비활성"}
                        </Badge>
                        <span>{zap.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {zap.lastRun ? `마지막 실행: ${formatDate(zap.lastRun)}` : "실행 기록 없음"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Button variant="outline" onClick={() => setShowZapierDialog(true)}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Zapier 연결하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <a
              href="https://zapier.com/app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Zapier 열기
            </a>
            {config.zapier.connected && (
              <Button variant="ghost" size="sm" onClick={() => setShowZapierDialog(true)}>
                Zap 추가
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* 통합 서비스 설정 다이얼로그 */}
      {/* Google Sheets 설정 다이얼로그 */}
      <Dialog open={showGoogleSheetsDialog} onOpenChange={setShowGoogleSheetsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Sheets 연결 설정</DialogTitle>
            <DialogDescription>Google Sheets 스프레드시트 ID를 입력하여 학생 데이터를 연동합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sheetId">스프레드시트 ID</Label>
              <Input
                id="sheetId"
                placeholder="예: 1AbCdEfGhIjKlMnOpQrStUvWxYz"
                value={newSheetId}
                onChange={(e) => setNewSheetId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                스프레드시트 URL에서 /d/ 다음과 /edit 이전의 문자열이 ID입니다.
              </p>
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                스프레드시트는 '링크가 있는 모든 사용자'에게 최소한 '뷰어' 권한이 부여되어 있어야 합니다.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoogleSheetsDialog(false)}>
              취소
            </Button>
            <Button onClick={connectGoogleSheets} disabled={isSyncing}>
              {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              연결
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Forms 설정 다이얼로그 */}
      <Dialog open={showGoogleFormsDialog} onOpenChange={setShowGoogleFormsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Google Forms 연결 설정</DialogTitle>
            <DialogDescription>Google Forms ID를 입력하여 데이터 수집 폼을 연동합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="formId">폼 ID</Label>
              <Input
                id="formId"
                placeholder="예: 1aB2cD3eF4gH5iJ6kL7mN8oP9q"
                value={newFormId}
                onChange={(e) => setNewFormId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                폼 URL에서 /d/ 또는 /forms/d/e/ 다음과 /edit 이전의 문자열이 ID입니다.
              </p>
            </div>
            <Tabs defaultValue="attendance" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="attendance">출석 체크</TabsTrigger>
                <TabsTrigger value="assignment">과제 제출</TabsTrigger>
                <TabsTrigger value="exam">시험 결과</TabsTrigger>
              </TabsList>
              <TabsContent value="attendance" className="space-y-4 mt-2">
                <p className="text-sm">출석 체크를 위한 Google Form 템플릿을 사용하세요.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => createForm("attendance")}
                  disabled={isCreatingForm}
                >
                  {isCreatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  출석 체크 폼 생성하기
                </Button>
              </TabsContent>
              <TabsContent value="assignment" className="space-y-4 mt-2">
                <p className="text-sm">과제 제출을 위한 Google Form 템플릿을 사용하세요.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => createForm("assignment")}
                  disabled={isCreatingForm}
                >
                  {isCreatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  과제 제출 폼 생성하기
                </Button>
              </TabsContent>
              <TabsContent value="exam" className="space-y-4 mt-2">
                <p className="text-sm">시험 결과 입력을 위한 Google Form 템플릿을 사용하세요.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => createForm("exam")}
                  disabled={isCreatingForm}
                >
                  {isCreatingForm ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  시험 결과 폼 생성하기
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoogleFormsDialog(false)}>
              취소
            </Button>
            <Button onClick={addGoogleForm} disabled={!newFormId.trim()}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Power Automate 설정 다이얼로그 */}
      <Dialog open={showPowerAutomateDialog} onOpenChange={setShowPowerAutomateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Power Automate 연결 설정</DialogTitle>
            <DialogDescription>
              Microsoft Power Automate 플로우를 등록하여 자동화 워크플로우를 연동합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="flowName">플로우 이름</Label>
              <Input
                id="flowName"
                placeholder="예: 학생 등록 자동화"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
              />
            </div>
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">템플릿</TabsTrigger>
                <TabsTrigger value="custom">사용자 정의</TabsTrigger>
              </TabsList>
              <TabsContent value="templates" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewFlowName("학생 등록 자동화")}
                  >
                    <div>
                      <div className="font-medium">학생 등록 자동화</div>
                      <div className="text-xs text-muted-foreground">
                        Google Form으로 수집된 학생 정보를 자동으로 데이터베이스에 추가하고 환영 이메일 발송
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewFlowName("과제 제출 알림")}
                  >
                    <div>
                      <div className="font-medium">과제 제출 알림</div>
                      <div className="text-xs text-muted-foreground">
                        과제 제출 시 자동 확인 이메일 발송 및 마감일 전 미제출 학생에게 알림
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewFlowName("성적 분석 자동화")}
                  >
                    <div>
                      <div className="font-medium">성적 분석 자동화</div>
                      <div className="text-xs text-muted-foreground">
                        시험 결과가 입력되면 자동으로 성적 분석 및 리포트 생성
                      </div>
                    </div>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="custom" className="space-y-4 mt-2">
                <p className="text-sm">Power Automate에서 직접 플로우를 생성한 후 여기에 등록하세요.</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="https://make.powerautomate.com/create" target="_blank" rel="noopener noreferrer">
                    Power Automate에서 새 플로우 만들기
                  </a>
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPowerAutomateDialog(false)}>
              취소
            </Button>
            <Button onClick={addPowerAutomateFlow} disabled={!newFlowName.trim()}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zapier 설정 다이얼로그 */}
      <Dialog open={showZapierDialog} onOpenChange={setShowZapierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zapier 연결 설정</DialogTitle>
            <DialogDescription>Zapier Zap을 등록하여 다양한 앱과 서비스를 연동합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="zapName">Zap 이름</Label>
              <Input
                id="zapName"
                placeholder="예: 문서 자동 생성"
                value={newZapName}
                onChange={(e) => setNewZapName(e.target.value)}
              />
            </div>
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="templates">템플릿</TabsTrigger>
                <TabsTrigger value="custom">사용자 정의</TabsTrigger>
              </TabsList>
              <TabsContent value="templates" className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewZapName("문서 자동 생성")}
                  >
                    <div>
                      <div className="font-medium">문서 자동 생성</div>
                      <div className="text-xs text-muted-foreground">
                        새 학생 등록 시 Google Drive에 학생별 폴더 자동 생성
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewZapName("SMS 알림 발송")}
                  >
                    <div>
                      <div className="font-medium">SMS 알림 발송</div>
                      <div className="text-xs text-muted-foreground">
                        마감일 1일 전 미제출 학생에게 SMS 알림 자동 발송
                      </div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => setNewZapName("캘린더 일정 동기화")}
                  >
                    <div>
                      <div className="font-medium">캘린더 일정 동기화</div>
                      <div className="text-xs text-muted-foreground">
                        새로운 과제나 시험이 등록되면 Google 캘린더에 자동으로 일정 추가
                      </div>
                    </div>
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="custom" className="space-y-4 mt-2">
                <p className="text-sm">Zapier에서 직접 Zap을 생성한 후 여기에 등록하세요.</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href="https://zapier.com/app/editor" target="_blank" rel="noopener noreferrer">
                    Zapier에서 새 Zap 만들기
                  </a>
                </Button>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowZapierDialog(false)}>
              취소
            </Button>
            <Button onClick={addZapierZap} disabled={!newZapName.trim()}>
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
