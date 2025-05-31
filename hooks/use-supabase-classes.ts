"use client"

import { useState, useEffect } from "react"
import { getSupabaseClient, handleSupabaseError } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/types"
import { useAuth } from "./use-auth"

type Class = Database["public"]["Tables"]["classes"]["Row"]
type ClassInsert = Database["public"]["Tables"]["classes"]["Insert"]
type ClassUpdate = Database["public"]["Tables"]["classes"]["Update"]

export const useSupabaseClasses = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const supabase = getSupabaseClient()

  // Fetch classes
  const fetchClasses = async () => {
    try {
      if (!user) {
        setClasses([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      setClasses(data || [])
    } catch (error) {
      const errorResult = handleSupabaseError(error, "fetch classes")
      setError(errorResult.message)
    } finally {
      setLoading(false)
    }
  }

  // Add class
  const addClass = async (name: string) => {
    try {
      if (!user) {
        throw new Error("사용자가 로그인되어 있지 않습니다.")
      }

      // Check if class with this name already exists
      const existingClass = classes.find((c) => c.name === name)
      if (existingClass) {
        throw new Error("같은 이름의 반이 이미 존재합니다.")
      }

      const classData: ClassInsert = {
        name,
        teacher_id: user.id,
      }

      const { data, error } = await supabase.from("classes").insert(classData).select().single()

      if (error) {
        throw error
      }

      setClasses((prev) => [...prev, data])
      return { success: true, data }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "add class")
      setError(errorResult.message)
      return { success: false, error: errorResult }
    }
  }

  // Edit class
  const editClass = async (id: string, newName: string) => {
    try {
      // Check if another class with this name already exists
      const existingClass = classes.find((c) => c.name === newName && c.id !== id)
      if (existingClass) {
        throw new Error("같은 이름의 반이 이미 존재합니다.")
      }

      const updateData: ClassUpdate = {
        name: newName,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("classes").update(updateData).eq("id", id).select().single()

      if (error) {
        throw error
      }

      setClasses((prev) => prev.map((c) => (c.id === id ? data : c)))
      return { success: true, data }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "edit class")
      setError(errorResult.message)
      return { success: false, error: errorResult }
    }
  }

  // Delete class
  const deleteClass = async (id: string) => {
    try {
      // Check if class has students
      const { data: students, error: studentsError } = await supabase
        .from("students")
        .select("id")
        .eq("class_id", id)
        .limit(1)

      if (studentsError) {
        throw studentsError
      }

      if (students && students.length > 0) {
        throw new Error("학생이 있는 반은 삭제할 수 없습니다. 먼저 학생들을 다른 반으로 이동시켜주세요.")
      }

      const { error } = await supabase.from("classes").delete().eq("id", id)

      if (error) {
        throw error
      }

      setClasses((prev) => prev.filter((c) => c.id !== id))
      return { success: true }
    } catch (error) {
      const errorResult = handleSupabaseError(error, "delete class")
      setError(errorResult.message)
      return { success: false, error: errorResult }
    }
  }

  useEffect(() => {
    fetchClasses()
  }, [user])

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("classes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "classes",
          filter: `teacher_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Classes change received:", payload)
          fetchClasses() // Refetch data on changes
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    classes,
    loading,
    error,
    addClass,
    editClass,
    deleteClass,
    refetch: fetchClasses,
  }
}
