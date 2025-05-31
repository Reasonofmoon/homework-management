import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./types"

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Server-side authentication check
export const getServerSession = async () => {
  try {
    const supabase = createServerClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Session error:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Server session error:", error)
    return null
  }
}

// Get user profile server-side
export const getServerUserProfile = async () => {
  try {
    const session = await getServerSession()
    if (!session?.user) return null

    const supabase = createServerClient()
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Profile fetch error:", error)
      return null
    }

    return profile
  } catch (error) {
    console.error("Server profile error:", error)
    return null
  }
}
