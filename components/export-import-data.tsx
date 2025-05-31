"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, Check } from "lucide-react"
import storageAdapter from "@/lib/local-storage-adapter"

export function ExportImportData() {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleExport = async () => {
    try {
      // Get all keys from storage
      const keys = await storageAdapter.keys()

      // Create an object with all data
      const exportData: Record<string, any> = {}

      for (const key of keys) {
        // Skip certain keys if needed
        if (key === "local_banner_dismissed") continue

        const value = await storageAdapter.getItem(key)
        exportData[key] = value
      }

      // Convert to JSON and create a blob
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `student-homework-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setImportStatus("success")
      setStatusMessage("데이터가 성공적으로 내보내기 되었습니다.")

      // Reset status after 3 seconds
      setTimeout(() => {
        setImportStatus("idle")
        setStatusMessage("")
      }, 3000)
    } catch (error) {
      console.error("Export error:", error)
      setImportStatus("error")
      setStatusMessage("데이터 내보내기 중 오류가 발생했습니다.")
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      setImportStatus("error")
      setStatusMessage("가져올 파일을 선택해주세요.")
      return
    }

    try {
      const fileContent = await importFile.text()
      const importData = JSON.parse(fileContent)

      // Validate the data structure
      if (typeof importData !== "object") {
        throw new Error("유효하지 않은 데이터 형식입니다.")
      }

      // Import each key-value pair
      for (const [key, value] of Object.entries(importData)) {
        await storageAdapter.setItem(key, value)
      }

      setImportStatus("success")
      setStatusMessage("데이터가 성공적으로 가져오기 되었습니다. 페이지를 새로고침하세요.")

      // Offer to refresh the page
      setTimeout(() => {
        if (
          confirm(
            "데이터가 가져와졌습니다. 변경사항을 적용하려면 페이지를 새로고침해야 합니다. 지금 새로고침하시겠습니까?",
          )
        ) {
          window.location.reload()
        }
      }, 1000)
    } catch (error) {
      console.error("Import error:", error)
      setImportStatus("error")
      setStatusMessage("데이터 가져오기 중 오류가 발생했습니다. 파일 형식을 확인하세요.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>데이터 관리</CardTitle>
        <CardDescription>애플리케이션 데이터를 내보내거나 가져옵니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">데이터 내보내기</TabsTrigger>
            <TabsTrigger value="import">데이터 가져오기</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                현재 애플리케이션에 저장된 모든 데이터를 JSON 파일로 내보냅니다. 이 파일은 백업용으로 사용하거나 다른
                기기로 데이터를 이전할 때 사용할 수 있습니다.
              </p>
              <Button onClick={handleExport} className="w-full gap-2">
                <Download className="h-4 w-4" />
                데이터 내보내기
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                이전에 내보낸 JSON 파일에서 데이터를 가져옵니다. 이 작업은 현재 저장된 데이터를 덮어쓸 수 있으므로
                주의하세요.
              </p>
              <div className="grid gap-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={handleImport} disabled={!importFile} className="gap-2">
                  <Upload className="h-4 w-4" />
                  데이터 가져오기
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {importStatus === "error" && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        {importStatus === "success" && (
          <Alert className="mt-4 bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
            <Check className="h-4 w-4" />
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        데이터는 브라우저의 로컬 스토리지에 저장됩니다. 브라우저 데이터를 지우면 모든 데이터가 삭제될 수 있으므로
        정기적으로 내보내기하는 것이 좋습니다.
      </CardFooter>
    </Card>
  )
}
