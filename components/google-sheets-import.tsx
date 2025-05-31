"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { useClasses } from "@/hooks/use-classes"

interface Student {
  id: string
  name: string
  group: string
  status: "active" | "inactive"
  completionRate: number
}

interface GoogleSheetsImportProps {
  onImportSuccess: (students: Student[]) => void
}

export function GoogleSheetsImport({ onImportSuccess }: GoogleSheetsImportProps) {
  const [importMethod, setImportMethod] = useState<"url" | "paste">("url")
  const [sheetUrl, setSheetUrl] = useState("")
  const [pastedData, setPastedData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const { classes } = useClasses()

  const handleImport = () => {
    setIsLoading(true)

    // 실제 구현에서는 여기서 Google Sheets API를 호출하거나
    // 붙여넣은 데이터를 파싱하는 로직이 들어갑니다.
    setTimeout(() => {
      try {
        if (importMethod === "url" && !sheetUrl.includes("docs.google.com/spreadsheets")) {
          setImportStatus("error")
          setStatusMessage("유효한 구글 시트 URL이 아닙니다.")
          setIsLoading(false)
          return
        } else if (importMethod === "paste" && pastedData.trim() === "") {
          setImportStatus("error")
          setStatusMessage("붙여넣은 데이터가 없습니다.")
          setIsLoading(false)
          return
        }

        // 데이터 파싱 및 가공
        let importedStudents: Student[] = []

        if (importMethod === "url") {
          // 실제 구현에서는 Google Sheets API를 사용하여 데이터를 가져옵니다.
          // 여기서는 예시 데이터를 사용합니다.
          importedStudents = [
            { id: "temp1", name: "이지훈", group: "A반", status: "active", completionRate: 0 },
            { id: "temp2", name: "박서연", group: "B반", status: "active", completionRate: 0 },
            { id: "temp3", name: "최민준", group: "A반", status: "active", completionRate: 0 },
          ]
        } else {
          // 붙여넣은 데이터 파싱
          const rows = pastedData.trim().split("\n")
          const headers = rows[0].split("\t")

          // 필수 열 인덱스 찾기
          const nameIndex = headers.findIndex((h) => h.includes("이름") || h.includes("학생"))
          const groupIndex = headers.findIndex((h) => h.includes("반") || h.includes("그룹"))
          const statusIndex = headers.findIndex((h) => h.includes("상태") || h.includes("활성"))

          if (nameIndex === -1 || groupIndex === -1) {
            throw new Error("필수 열(이름, 반)을 찾을 수 없습니다.")
          }

          // Add this after finding the column indices
          // This will automatically add any new classes found in the imported data
          const uniqueGroups = new Set<string>()
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split("\t")
            if (cells.length <= 1) continue // 빈 행 건너뛰기

            if (groupIndex !== -1) {
              const group = cells[groupIndex].trim()
              if (group) uniqueGroups.add(group)
            }
          }

          // Add any new groups that don't exist yet
          uniqueGroups.forEach((groupName) => {
            if (!classes.some((c) => c.name === groupName)) {
              addClass(groupName)
            }
          })

          // 데이터 행 처리
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split("\t")
            if (cells.length <= 1) continue // 빈 행 건너뛰기

            const name = cells[nameIndex].trim()
            const group = cells[groupIndex].trim()
            const status =
              statusIndex !== -1 && cells[statusIndex]?.toLowerCase().includes("비활성") ? "inactive" : "active"

            if (name && group) {
              importedStudents.push({
                id: `temp${i}`,
                name,
                group,
                status,
                completionRate: 0,
              })
            }
          }
        }

        if (importedStudents.length === 0) {
          throw new Error("가져올 학생 데이터가 없습니다.")
        }

        setImportStatus("success")
        setStatusMessage(`${importedStudents.length}명의 학생 데이터를 성공적으로 가져왔습니다.`)

        // 부모 컴포넌트에 데이터 전달
        onImportSuccess(importedStudents)
      } catch (error) {
        console.error("Import error:", error)
        setImportStatus("error")
        setStatusMessage(error instanceof Error ? error.message : "데이터 가져오기 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }, 1500)
  }

  const addClass = (name: string) => {
    // Generate a new ID
    const newId = (Math.max(...classes.map((c) => Number.parseInt(c.id)), 0) + 1).toString()

    // Check if class with this name already exists
    if (classes.some((c) => c.name === name)) {
      return false
    }

    // Update local storage directly
    const updatedClasses = [...classes, { id: newId, name }]
    localStorage.setItem("class-groups", JSON.stringify(updatedClasses))
    return true
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="url" onValueChange={(value) => setImportMethod(value as "url" | "paste")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">구글 시트 URL</TabsTrigger>
          <TabsTrigger value="paste">데이터 붙여넣기</TabsTrigger>
        </TabsList>
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              구글 시트의 공유 URL을 입력하세요. 시트는 공개 또는 링크가 있는 사용자에게 공유되어야 합니다.
            </p>
            <Input
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
            />
          </div>
        </TabsContent>
        <TabsContent value="paste" className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              구글 시트에서 복사한 데이터를 아래에 붙여넣으세요. 첫 번째 행은 헤더로 간주됩니다.
            </p>
            <Textarea
              placeholder="여기에 데이터를 붙여넣으세요..."
              value={pastedData}
              onChange={(e) => setPastedData(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </TabsContent>
      </Tabs>

      {importStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      {importStatus === "success" && (
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "가져오는 중..." : "가져오기"}
        </Button>
      </div>
    </div>
  )
}
