"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"
import { testSupabaseConnection, checkDatabaseHealth } from "@/lib/supabase/client"

interface DatabaseStatus {
  connection: { success: boolean; message: string } | null
  health: { success: boolean; message: string; missingTables?: string[] } | null
  loading: boolean
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus>({
    connection: null,
    health: null,
    loading: true,
  })

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }))

    try {
      // Test connection
      const connectionResult = await testSupabaseConnection()

      // Check database health
      const healthResult = await checkDatabaseHealth()

      setStatus({
        connection: connectionResult,
        health: healthResult,
        loading: false,
      })
    } catch (error) {
      console.error("Status check failed:", error)
      setStatus({
        connection: { success: false, message: "연결 테스트 실패" },
        health: { success: false, message: "데이터베이스 상태 확인 실패" },
        loading: false,
      })
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean | null) => {
    if (success === null) return <Badge variant="secondary">확인 중</Badge>
    return success ? (
      <Badge variant="default" className="bg-green-500">
        정상
      </Badge>
    ) : (
      <Badge variant="destructive">오류</Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              데이터베이스 상태
              {status.loading && <RefreshCw className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>Supabase 연결 및 데이터베이스 테이블 상태를 확인합니다.</CardDescription>
          </div>
          <Button onClick={checkStatus} disabled={status.loading} size="sm">
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.connection?.success ?? null)}
            <span className="font-medium">Supabase 연결</span>
          </div>
          {getStatusBadge(status.connection?.success ?? null)}
        </div>

        {status.connection && !status.connection.success && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{status.connection.message}</AlertDescription>
          </Alert>
        )}

        {/* Database Health */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.health?.success ?? null)}
            <span className="font-medium">데이터베이스 테이블</span>
          </div>
          {getStatusBadge(status.health?.success ?? null)}
        </div>

        {status.health && !status.health.success && status.health.missingTables && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>{status.health.message}</p>
                <p className="text-sm">Supabase 대시보드의 SQL 편집기에서 database/setup.sql 파일을 실행해주세요.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {status.connection?.success && status.health?.success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              모든 시스템이 정상적으로 작동하고 있습니다. 숙제 관리 시스템을 사용할 준비가 완료되었습니다.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
