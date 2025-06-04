"use client"

import { useEffect, useState } from "react"
import type { User, Session } from "@supabase/auth-helpers-nextjs"
import { getSupabaseClient, handleSupabaseError } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { useRouter } from "next/navigation"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  })

  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          throw error
        }

        if (session?.user) {
          await fetchUserProfile(session.user.id)
        }

        setAuthState((prev) => ({
          ...prev,
          session,
          user: session?.user || null,
          loading: false,
        }))
      } catch (error) {
        const errorResult = handleSupabaseError(error, "initial session")
        setAuthState((prev) => ({
          ...prev,
          error: errorResult.message,
          loading: false,
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setAuthState((prev) => ({
          ...prev,
          profile: null,
        }))
      }

      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user || null,
        loading: false,
      }))

      // Remove automatic redirects from here to prevent conflicts
      // Let the middleware and components handle redirects
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      setAuthState((prev) => ({
        ...prev,
        profile: profile || null,
      }))

      return profile
    } catch (error) {
      const errorResult = handleSupabaseError(error, "fetch user profile")
      setAuthState((prev) => ({
        ...prev,
        error: errorResult.message,
      }))
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "sign in")
      setAuthState((prev) => ({
        ...prev,
        error: errorResult.message,
        loading: false,
      }))
      return { success: false, error: errorResult }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "sign up")
      setAuthState((prev) => ({
        ...prev,
        error: errorResult.message,
        loading: false,
      }))
      return { success: false, error: errorResult }
    }
  }

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      return { success: true }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "sign out")
      setAuthState((prev) => ({
        ...prev,
        error: errorResult.message,
        loading: false,
      }))
      return { success: false, error: errorResult }
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!authState.user) {
        throw new Error("사용자가 로그인되어 있지 않습니다.")
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authState.user.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      setAuthState((prev) => ({
        ...prev,
        profile: data,
      }))

      return { success: true, data }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "update profile")
      return { success: false, error: errorResult }
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
    fetchUserProfile,
  }
}
