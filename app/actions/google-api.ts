// For static export, we'll convert server actions to client-side functions
// that return mock data

import type { Student, Assignment, Grade } from "@/lib/types"

// Mock data function instead of server action
export async function fetchStudentsFromSheet(sheetId: string): Promise<Student[]> {
  // Return mock data
  return [
    {
      id: "temp1",
      name: "이지훈",
      group: "A반",
      status: "active",
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Student,
    {
      id: "temp2",
      name: "박서연",
      group: "B반",
      status: "active",
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Student,
    {
      id: "temp3",
      name: "최민준",
      group: "A반",
      status: "active",
      completionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Student,
  ]
}

export async function saveStudentsToSheet(sheetId: string, students: Student[]): Promise<{ success: boolean }> {
  // Mock implementation
  console.log("Saving students to sheet:", sheetId, students.length)
  return { success: true }
}

export async function fetchAssignmentsFromSheet(sheetId: string): Promise<Assignment[]> {
  // Mock implementation
  return []
}

export async function saveGradesToSheet(sheetId: string, grades: Grade[]): Promise<{ success: boolean }> {
  // Mock implementation
  console.log("Saving grades to sheet:", sheetId, grades.length)
  return { success: true }
}

export async function runGradeAnalysis(sheetId: string): Promise<{ success: boolean }> {
  // Mock implementation
  console.log("Running grade analysis for sheet:", sheetId)
  return { success: true }
}

export async function createAttendanceForm(className: string, students: string[]): Promise<string> {
  // Mock implementation
  console.log("Creating attendance form for class:", className, "with", students.length, "students")
  return "mock-form-id-" + Date.now()
}

export async function createAssignmentSubmissionForm(assignmentTitle: string, students: string[]): Promise<string> {
  // Mock implementation
  console.log("Creating assignment submission form:", assignmentTitle, "for", students.length, "students")
  return "mock-form-id-" + Date.now()
}

export async function getFormResponses(formId: string): Promise<any[]> {
  // Mock implementation
  console.log("Getting responses for form:", formId)
  return []
}
