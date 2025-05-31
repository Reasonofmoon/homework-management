import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function fetchAssignments() {
  const { data, error } = await supabase.from('assignments').select('*')
  if (error) {
    console.error('Error fetching assignments: ', error)
    return []
  }
  return data
}

async function updateStudentAssignmentStatus(studentId: string, assignmentId: string, status: string) {
  const { data, error } = await supabase
    .from('student_assignments')
    .upsert({ student_id: studentId, assignment_id: assignmentId, status }, { onConflict: 'student_id,assignment_id' })
  if (error) {
    console.error('Failed to update status: ', error)
    return
  }
  return data
}
