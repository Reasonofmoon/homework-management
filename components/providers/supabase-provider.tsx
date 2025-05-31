"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"
import { createClient, testSupabaseConnection, validateSupabaseConfig } from "@/lib/supabase/client"
import { SupabaseErrorFallback } from "../supabase-error-fallback"

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null
  isConnected: boolean
  connectionError: string | null
  isLoading: boolean
  configValid: boolean
  retryConnection: () => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [configValid, setConfigValid] = useState(false)

  const initializeSupabase = async () => {
    setIsLoading(true)
    setConnectionError(null)

    try {
      // Basic validation
      const configValidation = validateSupabaseConfig()
      setConfigValid(configValidation.isValid)

      if (!configValidation.config.hasUrl || !configValidation.config.hasKey) {
        throw new Error("환경 변수가 설정되지 않았습니다.")
      }

      // Create client
      const client = createClient()
      setSupabase(client)

      // Test connection with timeout
      const connectionPromise = testSupabaseConnection()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 15000),
      )

      const result = (await Promise.race([connectionPromise, timeoutPromise])) as any

      if (result.success) {
        setIsConnected(true)
        setConnectionError(null)
        setConfigValid(true)
      } else {
        setIsConnected(false)
        setConnectionError(result.message || "Connection failed")
      }
    } catch (error: any) {
      console.error("Failed to initialize Supabase:", error)
      setIsConnected(false)
      setConnectionError(error.message || "Supabase 초기화에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const retryConnection = () => {
    initializeSupabase()
  }

  useEffect(() => {
    initializeSupabase()
  }, [])

  // Show error fallback if there's a connection error
  if (!isLoading && (connectionError || !configValid)) {
    return (
      <SupabaseErrorFallback
        error={connectionError}
        isLoading={isLoading}
        configValid={configValid}
        onRetry={retryConnection}
      />
    )
  }

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isConnected,
        connectionError,
        isLoading,
        configValid,
        retryConnection,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
