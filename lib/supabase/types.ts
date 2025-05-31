export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: "teacher" | "admin"
          created_at: string
          updated_at: string
          name: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "teacher" | "admin"
          created_at?: string
          updated_at?: string
          name?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: "teacher" | "admin"
          created_at?: string
          updated_at?: string
          name?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          teacher_id: string
          created_at: string
          updated_at: string
          description: string | null
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          teacher_id: string
          created_at?: string
          updated_at?: string
          description?: string | null
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          teacher_id?: string
          created_at?: string
          updated_at?: string
          description?: string | null
          user_id?: string
        }
      }
      students: {
        Row: {
          id: string
          name: string
          class_id: string
          status: "active" | "inactive"
          completion_rate: number
          teacher_id: string
          created_at: string
          updated_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          class_id: string
          status?: "active" | "inactive"
          completion_rate?: number
          teacher_id: string
          created_at?: string
          updated_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          class_id?: string
          status?: "active" | "inactive"
          completion_rate?: number
          teacher_id?: string
          created_at?: string
          updated_at?: string
          email?: string | null
          user_id?: string
        }
      }
      assignments: {
        Row: {
          id: string
          title: string
          description: string
          due_date: string
          priority: "low" | "medium" | "high"
          status: "todo" | "in-progress" | "completed"
          teacher_id: string
          created_at: string
          updated_at: string
          class_id: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          due_date: string
          priority?: "low" | "medium" | "high"
          status?: "todo" | "in-progress" | "completed"
          teacher_id: string
          created_at?: string
          updated_at?: string
          class_id: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          due_date?: string
          priority?: "low" | "medium" | "high"
          status?: "todo" | "in-progress" | "completed"
          teacher_id?: string
          created_at?: string
          updated_at?: string
          class_id?: string
          user_id?: string
        }
      }
      assignment_students: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          status: "assigned" | "in-progress" | "completed" | "overdue"
          submitted_at: string | null
          grade: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          status?: "assigned" | "in-progress" | "completed" | "overdue"
          submitted_at?: string | null
          grade?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          status?: "assigned" | "in-progress" | "completed" | "overdue"
          submitted_at?: string | null
          grade?: number | null
          feedback?: string | null
          updated_at?: string
        }
      }
      student_assignments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          student_id: string
          assignment_id: string
          status: string
          grade: number | null
          feedback: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id: string
          assignment_id: string
          status: string
          grade?: number | null
          feedback?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          student_id?: string
          assignment_id?: string
          status?: string
          grade?: number | null
          feedback?: string | null
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "teacher" | "admin"
      assignment_status: "todo" | "in-progress" | "completed"
      student_status: "active" | "inactive"
      priority_level: "low" | "medium" | "high"
      submission_status: "assigned" | "in-progress" | "completed" | "overdue"
    }
  }
}
