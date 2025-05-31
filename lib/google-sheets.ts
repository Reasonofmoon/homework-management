import type { Student, Assignment, Grade } from "./types"
import {
  fetchStudentsFromSheet as fetchStudentsAction,
  saveStudentsToSheet as saveStudentsAction,
  fetchAssignmentsFromSheet as fetchAssignmentsAction,
  saveGradesToSheet as saveGradesToAction,
  runGradeAnalysis as runGradeAnalysisAction,
} from "@/app/actions/google-api"

// Client-side wrapper for the mock function
export async function fetchStudentsFromSheet(sheetId: string): Promise<Student[]> {
  try {
    return await fetchStudentsAction(sheetId)
  } catch (error) {
    console.error("Error fetching students from sheet:", error)
    return []
  }
}

// Client-side wrapper for the mock function
export async function saveStudentsToSheet(sheetId: string, students: Student[]): Promise<void> {
  try {
    await saveStudentsAction(sheetId, students)
  } catch (error) {
    console.error("Error saving students to sheet:", error)
  }
}

// Client-side wrapper for the mock function
export async function fetchAssignmentsFromSheet(sheetId: string): Promise<Assignment[]> {
  try {
    return await fetchAssignmentsAction(sheetId)
  } catch (error) {
    console.error("Error fetching assignments from sheet:", error)
    return []
  }
}

// Client-side wrapper for the mock function
export async function saveGradesToSheet(sheetId: string, grades: Grade[]): Promise<void> {
  try {
    await saveGradesToAction(sheetId, grades)
  } catch (error) {
    console.error("Error saving grades to sheet:", error)
  }
}

// Client-side wrapper for the mock function
export async function runGradeAnalysis(sheetId: string): Promise<void> {
  try {
    await runGradeAnalysisAction(sheetId)
  } catch (error) {
    console.error("Error running grade analysis:", error)
  }
}
