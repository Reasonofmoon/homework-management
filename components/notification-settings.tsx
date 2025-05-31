"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import type { NotificationSettings as NotificationSettingsType } from "@/lib/types"
import { Bell, Mail, MessageSquare, Save } from "lucide-react"
import { sendAssignmentReminders, sendGradeNotifications, sendAttendanceAlerts } from "@/lib/notifications"

const defaultSettings: NotificationSettingsType = {
  emailEnabled: true,
  smsEnabled: false,
  assignmentReminders: true,
  gradeNotifications: true,
  attendanceAlerts: true,
  reminderDays: 3,
}

export function NotificationSettings() {
  const [settings, setSettings] = useLocalStorage<NotificationSettingsType>("notification-settings", defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  const handleSaveSettings = () => {
    setIsSaving(true)

    // 설정 저장 시뮬레이션
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "설정 저장 완료",
        description: "알림 설정이 성공적으로 저장되었습니다.",
      })
    }, 1000)
  }

  const handleTestNotification = async (type: string) => {
    setIsTesting(true)

    try {
      // 테스트 데이터
      const students = JSON.parse(localStorage.getItem("students") || "[]")
      const assignments = JSON.parse(localStorage.getItem("assignments") || "[]")
      const grades = JSON.parse(localStorage.getItem("grades") || "[]")
      const attendances = JSON.parse(localStorage.getItem("attendances") || "[]")

      if (students.length === 0) {
        throw new Error("학생 데이터가 없습니다.")
      }

      // 알림 유형에 따라 테스트 실행
      if (type === "assignment") {
        if (assignments.length === 0) {
          throw new Error("숙제 데이터가 없습니다.")
        }
        await sendAssignmentReminders(students, assignments, settings)
      } else if (type === "grade") {
        if (grades.length === 0) {
          throw new Error("성적 데이터가 없습니다.")
        }
        await sendGradeNotifications(students, grades, assignments, settings)
      } else if (type === "attendance") {
        if (attendances.length === 0) {
          throw new Error("출석 데이터가 없습니다.")
        }
        await sendAttendanceAlerts(students, attendances, settings)
      }

      toast({
        title: "테스트 알림 발송 완료",
        description: "테스트 알림이 성공적으로 발송되었습니다.",
      })
    } catch (error) {
      console.error("테스트 알림 발송 중 오류 발생:", error)
      toast({
        title: "테스트 알림 발송 실패",
        description: error instanceof Error ? error.message : "알림을 발송하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          알림 설정
        </CardTitle>
        <CardDescription>학생 및 학부모에게 보내는 알림 설정을 관리합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="channels" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels">알림 채널</TabsTrigger>
            <TabsTrigger value="types">알림 유형</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="email-notifications" className="font-medium">
                      이메일 알림
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">학생 및 학부모에게 이메일로 알림을 발송합니다.</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <Label htmlFor="sms-notifications" className="font-medium">
                      SMS 알림
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">학부모에게 SMS로 중요한 알림을 발송합니다.</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.smsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })}
                />
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="reminder-days">마감일 알림 일수</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="reminder-days"
                    type="number"
                    min="1"
                    max="14"
                    value={settings.reminderDays}
                    onChange={(e) => setSettings({ ...settings, reminderDays: Number.parseInt(e.target.value) || 3 })}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">일 전에 마감일 알림 발송</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="assignment-reminders" className="font-medium">
                    과제 마감일 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">과제 마감일이 다가오면 알림을 발송합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="assignment-reminders"
                    checked={settings.assignmentReminders}
                    onCheckedChange={(checked) => setSettings({ ...settings, assignmentReminders: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification("assignment")}
                    disabled={isTesting}
                  >
                    테스트
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="grade-notifications" className="font-medium">
                    성적 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">새로운 성적이 등록되면 알림을 발송합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="grade-notifications"
                    checked={settings.gradeNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, gradeNotifications: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification("grade")}
                    disabled={isTesting}
                  >
                    테스트
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex flex-col space-y-1">
                  <Label htmlFor="attendance-alerts" className="font-medium">
                    출석 알림
                  </Label>
                  <p className="text-sm text-muted-foreground">학생이 결석하거나 지각하면 알림을 발송합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="attendance-alerts"
                    checked={settings.attendanceAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, attendanceAlerts: checked })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestNotification("attendance")}
                    disabled={isTesting}
                  >
                    테스트
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          설정 저장
        </Button>
      </CardFooter>
    </Card>
  )
}
