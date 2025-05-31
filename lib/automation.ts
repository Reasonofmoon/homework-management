import type { Student, Assignment, Grade } from "./types"
import { sendEmail, sendSMS } from "./notifications"
import { saveStudentsToSheet, saveGradesToSheet } from "./google-sheets"

// 학생 등록 자동화
export async function automateStudentRegistration(student: Student): Promise<boolean> {
  try {
    // 1. 로컬 데이터베이스에 학생 추가
    // 실제 구현에서는 데이터베이스 API 호출
    console.log(`학생 등록: ${student.name}`)

    // 2. Google Sheets에 학생 정보 추가
    // 실제 구현에서는 Google Sheets API 호출
    const sheetId = localStorage.getItem("googleSheetsId")
    if (sheetId) {
      const students = JSON.parse(localStorage.getItem("students") || "[]")
      students.push(student)
      await saveStudentsToSheet(sheetId, students)
    }

    // 3. 환영 이메일 발송
    if (student.parentEmail) {
      const subject = `[환영합니다] ${student.name} 학생이 등록되었습니다`
      const body = `
안녕하세요,

${student.name} 학생이 성공적으로 등록되었습니다.
학생 숙제 관리 시스템을 통해 학생의 숙제 진행 상황과 성적을 확인하실 수 있습니다.

감사합니다.
`
      await sendEmail(student.parentEmail, subject, body)
    }

    // 4. Google Drive에 학생 폴더 생성
    // 실제 구현에서는 Google Drive API 호출
    console.log(`Google Drive에 ${student.name} 폴더 생성`)

    return true
  } catch (error) {
    console.error("학생 등록 자동화 중 오류 발생:", error)
    return false
  }
}

// 과제 제출 자동화
export async function automateAssignmentSubmission(
  studentId: string,
  assignmentId: string,
  content: string,
  fileUrl?: string,
): Promise<boolean> {
  try {
    // 1. 학생 및 과제 정보 가져오기
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const assignments = JSON.parse(localStorage.getItem("assignments") || "[]")

    const student = students.find((s: Student) => s.id === studentId)
    const assignment = assignments.find((a: Assignment) => a.id === assignmentId)

    if (!student || !assignment) {
      throw new Error("학생 또는 과제 정보를 찾을 수 없습니다.")
    }

    // 2. 과제 제출 상태 업데이트
    const studentAssignments = JSON.parse(localStorage.getItem("studentAssignments") || "[]")
    const existingIndex = studentAssignments.findIndex(
      (sa: any) => sa.studentId === studentId && sa.assignmentId === assignmentId,
    )

    if (existingIndex >= 0) {
      studentAssignments[existingIndex].status = "completed"
      studentAssignments[existingIndex].submittedAt = new Date().toISOString()
    } else {
      studentAssignments.push({
        studentId,
        assignmentId,
        status: "completed",
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    localStorage.setItem("studentAssignments", JSON.stringify(studentAssignments))

    // 3. 확인 이메일 발송
    if (student.email) {
      const subject = `[제출 확인] ${assignment.title} 과제가 제출되었습니다`
      const body = `
안녕하세요 ${student.name}님,

${assignment.title} 과제가 성공적으로 제출되었습니다.
제출 시간: ${new Date().toLocaleString()}

감사합니다.
`
      await sendEmail(student.email, subject, body)
    }

    // 4. 교사에게 알림
    const teacherEmail = "teacher@example.com" // 실제 구현에서는 설정에서 가져옴
    const teacherSubject = `[과제 제출] ${student.name} - ${assignment.title}`
    const teacherBody = `
${student.name} 학생이 ${assignment.title} 과제를 제출했습니다.
제출 시간: ${new Date().toLocaleString()}

내용: ${content}
${fileUrl ? `첨부 파일: ${fileUrl}` : ""}
`
    await sendEmail(teacherEmail, teacherSubject, teacherBody)

    return true
  } catch (error) {
    console.error("과제 제출 자동화 중 오류 발생:", error)
    return false
  }
}

// 마감일 알림 자동화
export async function automateDeadlineReminders(): Promise<boolean> {
  try {
    // 1. 데이터 가져오기
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const assignments = JSON.parse(localStorage.getItem("assignments") || "[]")
    const studentAssignments = JSON.parse(localStorage.getItem("studentAssignments") || "[]")

    // 2. 마감일이 다가오는 과제 필터링 (3일 이내)
    const today = new Date()
    const upcomingAssignments = assignments.filter((assignment: Assignment) => {
      const dueDate = new Date(assignment.dueDate)
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 3 && assignment.status !== "completed"
    })

    if (upcomingAssignments.length === 0) {
      return true // 알림을 보낼 과제가 없음
    }

    // 3. 각 학생별로 알림 발송
    for (const student of students) {
      if (student.status !== "active") continue

      // 학생에게 할당된 과제 필터링
      const studentUpcomingAssignments = upcomingAssignments.filter(
        (assignment: Assignment) =>
          assignment.assignedTo.includes(student.name) ||
          assignment.assignedTo.includes("전체 학생") ||
          assignment.assignedTo.includes(student.group),
      )

      if (studentUpcomingAssignments.length === 0) continue

      // 이미 제출한 과제 제외
      const pendingAssignments = studentUpcomingAssignments.filter((assignment: Assignment) => {
        const submitted = studentAssignments.some(
          (sa: any) => sa.studentId === student.id && sa.assignmentId === assignment.id && sa.status === "completed",
        )
        return !submitted
      })

      if (pendingAssignments.length === 0) continue

      // 이메일 알림
      if (student.email) {
        const subject = `[마감일 알림] 곧 마감되는 과제가 있습니다`
        let body = `안녕하세요 ${student.name}님,\n\n다음 과제의 마감일이 다가오고 있습니다:\n\n`

        pendingAssignments.forEach((assignment: Assignment) => {
          const dueDate = new Date(assignment.dueDate).toLocaleDateString()
          body += `- ${assignment.title}: ${dueDate} 마감\n`
        })

        body += "\n과제를 제때 제출해주세요.\n\n감사합니다."

        await sendEmail(student.email, subject, body)
      }

      // 학부모 알림
      if (student.parentEmail) {
        const subject = `[마감일 알림] ${student.name} 학생의 과제 마감일이 다가옵니다`
        let body = `${student.name} 학생의 다음 과제 마감일이 다가옵니다:\n\n`

        pendingAssignments.forEach((assignment: Assignment) => {
          const dueDate = new Date(assignment.dueDate).toLocaleDateString()
          body += `- ${assignment.title}: ${dueDate} 마감\n`
        })

        body += "\n과제를 제때 제출할 수 있도록 확인 부탁드립니다."

        await sendEmail(student.parentEmail, subject, body)
      }

      // SMS 알림 (학부모)
      if (student.parentPhone) {
        const message = `[마감일 알림] ${student.name} 학생의 과제 ${pendingAssignments.length}개가 곧 마감됩니다. 가장 빠른 마감일: ${new Date(pendingAssignments[0].dueDate).toLocaleDateString()}`

        await sendSMS(student.parentPhone, message)
      }
    }

    return true
  } catch (error) {
    console.error("마감일 알림 자동화 중 오류 발생:", error)
    return false
  }
}

// 성적 입력 자동화
export async function automateGradeEntry(grade: Grade): Promise<boolean> {
  try {
    // 1. 로컬 데이터베이스에 성적 추가
    const grades = JSON.parse(localStorage.getItem("grades") || "[]")
    grades.push(grade)
    localStorage.setItem("grades", JSON.stringify(grades))

    // 2. Google Sheets에 성적 정보 추가
    const sheetId = localStorage.getItem("googleSheetsId")
    if (sheetId) {
      await saveGradesToSheet(sheetId, grades)
    }

    // 3. 학생 및 과제 정보 가져오기
    const students = JSON.parse(localStorage.getItem("students") || "[]")
    const assignments = JSON.parse(localStorage.getItem("assignments") || "[]")

    const student = students.find((s: Student) => s.id === grade.studentId)
    const assignment = assignments.find((a: Assignment) => a.id === grade.assignmentId)

    if (!student || !assignment) {
      throw new Error("학생 또는 과제 정보를 찾을 수 없습니다.")
    }

    // 4. 학생에게 성적 알림
    if (student.email) {
      const percentage = Math.round((grade.score / grade.maxScore) * 100)
      const subject = `[성적 알림] ${assignment.title} 과제 성적이 등록되었습니다`
      let body = `
안녕하세요 ${student.name}님,

${assignment.title} 과제의 성적이 등록되었습니다.
점수: ${grade.score}/${grade.maxScore} (${percentage}%)
`

      if (grade.feedback) {
        body += `\n피드백: ${grade.feedback}\n`
      }

      body += "\n감사합니다."

      await sendEmail(student.email, subject, body)
    }

    // 5. 학부모에게 성적 알림
    if (student.parentEmail) {
      const percentage = Math.round((grade.score / grade.maxScore) * 100)
      const subject = `[성적 알림] ${student.name} 학생의 ${assignment.title} 과제 성적`
      let body = `
${student.name} 학생의 ${assignment.title} 과제 성적이 등록되었습니다.
점수: ${grade.score}/${grade.maxScore} (${percentage}%)
`

      if (grade.feedback) {
        body += `\n피드백: ${grade.feedback}\n`
      }

      await sendEmail(student.parentEmail, subject, body)
    }

    return true
  } catch (error) {
    console.error("성적 입력 자동화 중 오류 발생:", error)
    return false
  }
}
