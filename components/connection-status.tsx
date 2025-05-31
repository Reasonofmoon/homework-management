"use client"

import type React from "react"

import { useSupabase } from "@/components/providers/supabase-provider"
import { SupabaseErrorFallback } from "@/components/supabase-error-fallback"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Loader2 } from "lucide-react"

interface ConnectionStatusProps {
  children: React.ReactNode
}

export function ConnectionStatus({ children }: ConnectionStatusProps) {
  const { isConnected, connectionError, isLoading, configValid, retryConnection } = useSupabase()

  // Show error fallback if there's a connection error
  if (connectionError && !isConnected) {
    return (
      <SupabaseErrorFallback
        error={connectionError}
        isLoading={isLoading}
        configValid={configValid}
        onRetry={retryConnection}
      />
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p>Supabase 연결 중...</p>
        </div>
      </div>
    )
  }

  // Show connection status banner if connected but with warnings
  return (
    <div>
      {isConnected && (
        <Alert className="mb-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="flex items-center gap-2">
            <span>Supabase 연결됨</span>
            <Badge variant="outline" className="text-green-600 border-green-600">
              온라인
            </Badge>
          </AlertDescription>
        </Alert>
      )}
      {children}
    </div>
  )
}
