"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/types"

interface SupabaseContextType {
  supabase: SupabaseClient<Database> | null
  isConnected: boolean
  connectionError: string | null
  isLoading: boolean
  retryConnection: () => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    // 컨텍스트가 없어도 기본값 반환 (오류 방지)
    return {
      supabase: null,
      isConnected: false,
      connectionError: "Provider not found",
      isLoading: false,
      retryConnection: () => {},
    }
  }
  return context
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const initializeSupabase = async () => {
    try {
      setIsLoading(true)
      setConnectionError(null)

      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("환경 변수가 설정되지 않았습니다.")
      }

      // 지연 로딩으로 Supabase 클라이언트 생성
      const { createClient } = await import("@supabase/supabase-js")

      const client = createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "homework-manager-auth",
        },
      })

      setSupabase(client)
      setIsConnected(true)
      console.log("Supabase Provider 초기화 성공")
    } catch (error: any) {
      console.error("Supabase Provider 초기화 실패:", error)
      setConnectionError(error.message)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const retryConnection = () => {
    initializeSupabase()
  }

  useEffect(() => {
    // 지연 초기화 (페이지 로드 후)
    const timer = setTimeout(() => {
      initializeSupabase()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <SupabaseContext.Provider
      value={{
        supabase,
        isConnected,
        connectionError,
        isLoading,
        retryConnection,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  )
}
