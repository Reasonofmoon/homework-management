import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Singleton pattern for client-side usage
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createClient = () => {
  // 이미 클라이언트가 존재하면 재사용 (중복 생성 방지)
  if (supabaseClient) {
    return supabaseClient
  }

  try {
    // Get environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    // 환경 변수 검증
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase 환경 변수가 설정되지 않았습니다.")
    }

    // Create client only once with optimized settings
    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "homework-manager-auth", // 고유한 storage key
      },
      global: {
        headers: {
          "x-client-info": "homework-manager@1.0.0",
        },
      },
      // 연결 타임아웃 설정
      db: {
        schema: "public",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })

    console.log("Supabase 클라이언트 초기화 성공")
    return supabaseClient
  } catch (error) {
    console.error("Supabase 클라이언트 초기화 실패:", error)
    throw error
  }
}

// 기존 함수들은 새로운 createClient 사용
export const getSupabaseClient = () => {
  return createClient()
}

// Error handling utility with better timeout handling
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Supabase error in ${context}:`, error)

  // Connection timeout 특별 처리
  if (error.message?.includes("Connection timeout") || error.message?.includes("timeout")) {
    return {
      error: true,
      message: "연결 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.",
      details: error.message,
      code: "CONNECTION_TIMEOUT",
      isNetworkError: true,
    }
  }

  // Network and connection error messages
  const networkErrors = [
    "Failed to fetch",
    "Network request failed",
    "TypeError: Failed to fetch",
    "fetch is not defined",
    "NetworkError",
    "Invalid URL",
  ]

  const isNetworkError = networkErrors.some(
    (netError) => error.message?.includes(netError) || error.toString().includes(netError),
  )

  if (isNetworkError) {
    return {
      error: true,
      message: "네트워크 연결을 확인해주세요. Supabase 서버에 연결할 수 없습니다.",
      details: error.message,
      code: "NETWORK_ERROR",
      isNetworkError: true,
    }
  }

  // Common error messages in Korean
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "로그인 정보가 올바르지 않습니다.",
    "Email not confirmed": "이메일 인증이 필요합니다.",
    "User already registered": "이미 등록된 사용자입니다.",
    "Email rate limit exceeded": "이메일 전송 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
    "Signup disabled": "회원가입이 비활성화되어 있습니다.",
    "Invalid API key": "API 키가 올바르지 않습니다.",
    "Project not found": "Supabase 프로젝트를 찾을 수 없습니다.",
  }

  const userMessage = errorMessages[error.message] || "오류가 발생했습니다. 다시 시도해주세요."

  return {
    error: true,
    message: userMessage,
    details: error.message,
    code: error.code,
    isNetworkError: false,
  }
}

// Retry logic for connection timeout
export const withRetry = async (operation: () => Promise<any>, maxRetries = 3, delay = 1000): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error
      }

      // 연결 타임아웃이나 네트워크 오류인 경우에만 재시도
      if (error.message?.includes("timeout") || error.message?.includes("Failed to fetch")) {
        console.log(`재시도 ${attempt}/${maxRetries} - ${delay}ms 후 다시 시도`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2 // 지수 백오프
      } else {
        throw error
      }
    }
  }
  throw new Error("최대 재시도 횟수 초과")
}

// Simple connection test with retry
export const testSupabaseConnection = async () => {
  try {
    return await withRetry(async () => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: "Supabase 연결이 성공적으로 확인되었습니다.",
        hasSession: !!data.session,
      }
    })
  } catch (error: any) {
    return handleSupabaseError(error, "connection test")
  }
}

// Database health check with retry
export const checkDatabaseHealth = async () => {
  try {
    return await withRetry(async () => {
      const supabase = getSupabaseClient()

      // First check if we can connect at all
      const connectionTest = await testSupabaseConnection()
      if (!connectionTest.success) {
        throw new Error(connectionTest.message)
      }

      // Check if required tables exist
      const tables = ["profiles", "classes", "students", "assignments", "student_assignments"]
      const results = await Promise.all(
        tables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select("count").limit(1)
            return { table, exists: !error, error: error?.message }
          } catch (err: any) {
            return { table, exists: false, error: err.message }
          }
        }),
      )

      const missingTables = results.filter((r) => !r.exists).map((r) => r.table)

      if (missingTables.length > 0) {
        return {
          success: false,
          message: `다음 테이블이 누락되었습니다: ${missingTables.join(", ")}`,
          missingTables,
          tableResults: results,
        }
      }

      return {
        success: true,
        message: "모든 데이터베이스 테이블이 정상적으로 확인되었습니다.",
        tables: results,
      }
    })
  } catch (error: any) {
    return handleSupabaseError(error, "database health check")
  }
}

// Environment validation utility
export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const issues: string[] = []

  if (!url) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.")
  }

  if (!key) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.")
  }

  return {
    isValid: issues.length === 0,
    issues,
    config: {
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url ? url.length : 0,
      keyLength: key ? key.length : 0,
    },
  }
}
