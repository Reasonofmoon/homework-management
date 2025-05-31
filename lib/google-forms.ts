import {
  createAttendanceForm as createAttendanceFormAction,
  createAssignmentSubmissionForm as createAssignmentSubmissionFormAction,
  getFormResponses as getFormResponsesAction,
} from "@/app/actions/google-api"

// Client-side wrapper for the mock function
export async function createAttendanceForm(className: string, students: string[]): Promise<string> {
  try {
    return await createAttendanceFormAction(className, students)
  } catch (error) {
    console.error("Error creating attendance form:", error)
    return "error-mock-form-id"
  }
}

// Client-side wrapper for the mock function
export async function createAssignmentSubmissionForm(assignmentTitle: string, students: string[]): Promise<string> {
  try {
    return await createAssignmentSubmissionFormAction(assignmentTitle, students)
  } catch (error) {
    console.error("Error creating assignment submission form:", error)
    return "error-mock-form-id"
  }
}

// Client-side wrapper for the mock function
export async function getFormResponses(formId: string) {
  try {
    return await getFormResponsesAction(formId)
  } catch (error) {
    console.error("Error getting form responses:", error)
    return []
  }
}
