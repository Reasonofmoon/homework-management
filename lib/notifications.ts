import type { Student, Assignment, Grade, NotificationSettings } from "./types"

// 이메일 발송 함수
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    // 실제 구현에서는 이메일 서비스 API를 호출
    // 여기서는 시뮬레이션만 수행
    console.log(`이메일 발송: ${to}, 제목: ${subject}`)

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  } catch (error) {
    console.error("이메일 발송 중 오류 발생:", error)
    return false
  }
}

// SMS 발송 함수
export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    // 실제 구현에서는 Twilio 또는 다른 SMS 서비스 API를 호출
    // 여기서는 시뮬레이션만 수행
    console.log(`SMS 발송: ${to}, 메시지: ${message}`)

    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  } catch (error) {
    console.error("SMS 발송 중 오류 발생:", error)
    return false
  }
}

// 과제 마감일 알림 발송
export async function sendAssignmentReminders(
  students: Student[],
  assignments: Assignment[],
  settings: NotificationSettings,
): Promise<void> {
  // 오늘 날짜
  const today = new Date()

  // 마감일이 다가오는 과제 필터링
  const upcomingAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.dueDate)
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= settings.reminderDays && assignment.status !== "completed"
  })

  // 각 학생별로 알림 발송
  for (const student of students) {
    if (student.status !== "active") continue

    // 학생에게 할당된 과제 필터링
    const studentAssignments = upcomingAssignments.filter(
      (assignment) =>
        assignment.assignedTo.includes(student.name) ||
        assignment.assignedTo.includes("전체 학생") ||
        assignment.assignedTo.includes(student.group),
    )

    if (studentAssignments.length === 0) continue

    // 이메일 알림
    if (settings.emailEnabled && settings.assignmentReminders && student.parentEmail) {
      const subject = `[마감일 알림] ${student.name} 학생의 과제 마감일이 다가옵니다`
      let body = `${student.name} 학생의 다음 과제 마감일이 다가옵니다:\n\n`

      studentAssignments.forEach((assignment) => {
        const dueDate = new Date(assignment.dueDate).toLocaleDateString()
        body += `- ${assignment.title}: ${dueDate} 마감\n`
      })

      body += "\n과제를 제때 제출할 수 있도록 확인 부탁드립니다."

      await sendEmail(student.parentEmail, subject, body)
    }

    // SMS 알림
    if (settings.smsEnabled && settings.assignmentReminders && student.parentPhone) {
      const message = `[마감일 알림] ${student.name} 학생의 과제 ${studentAssignments.length}개가 곧 마감됩니다. 가장 빠른 마감일: ${new Date(studentAssignments[0].dueDate).toLocaleDateString()}`

      await sendSMS(student.parentPhone, message)
    }
  }
}

// 성적 알림 발송
export async function sendGradeNotifications(
  students: Student[],
  grades: Grade[],
  assignments: Assignment[],
  settings: NotificationSettings,
): Promise<void> {
  // 최근 추가된 성적 필터링 (24시간 이내)
  const recentGrades = grades.filter((grade) => {
    const createdAt = new Date(grade.createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    return diffHours <= 24
  })

  // 각 학생별로 알림 발송
  for (const student of students) {
    if (student.status !== "active") continue

    // 학생의 최근 성적 필터링
    const studentGrades = recentGrades.filter((grade) => grade.studentId === student.id)

    if (studentGrades.length === 0) continue

    // 이메일 알림
    if (settings.emailEnabled && settings.gradeNotifications && student.parentEmail) {
      const subject = `[성적 알림] ${student.name} 학생의 새로운 성적이 등록되었습니다`
      let body = `${student.name} 학생의 다음 과제에 대한 성적이 등록되었습니다:\n\n`

      for (const grade of studentGrades) {
        const assignment = assignments.find((a) => a.id === grade.assignmentId)
        if (!assignment) continue

        const percentage = Math.round((grade.score / grade.maxScore) * 100)
        body += `- ${assignment.title}: ${grade.score}/${grade.maxScore} (${percentage}%)\n`
        if (grade.feedback) {
          body += `  피드백: ${grade.feedback}\n`
        }
        body += "\n"
      }

      await sendEmail(student.parentEmail, subject, body)
    }
  }
}

// 출석 알림 발송
export async function sendAttendanceAlerts(
  students: Student[],
  attendances: { [key: string]: any }[],
  settings: NotificationSettings,
): Promise<void> {
  // 오늘 날짜
  const today = new Date().toISOString().split("T")[0]

  // 오늘 결석한 학생 필터링
  const absentStudents = attendances
    .filter((att) => att.date.startsWith(today) && (att.status === "absent" || att.status === "late"))
    .map((att) => att.studentId)

  // 각 학생별로 알림 발송
  for (const studentId of absentStudents) {
    const student = students.find((s) => s.id === studentId)
    if (!student || student.status !== "active") continue

    const attendance = attendances.find((att) => att.studentId === studentId && att.date.startsWith(today))
    if (!attendance) continue

    // 이메일 알림
    if (settings.emailEnabled && settings.attendanceAlerts && student.parentEmail) {
      const subject = `[출석 알림] ${student.name} 학생의 출석 상태 알림`
      let body = `${student.name} 학생이 오늘(${new Date().toLocaleDateString()}) `

      if (attendance.status === "absent") {
        body += "결석하였습니다."
      } else if (attendance.status === "late") {
        body += "지각하였습니다."
      }

      if (attendance.notes) {
        body += `\n\n비고: ${attendance.notes}`
      }

      await sendEmail(student.parentEmail, subject, body)
    }

    // SMS 알림
    if (settings.smsEnabled && settings.attendanceAlerts && student.parentPhone) {
      let message = `[출석 알림] ${student.name} 학생이 오늘(${new Date().toLocaleDateString()}) `

      if (attendance.status === "absent") {
        message += "결석하였습니다."
      } else if (attendance.status === "late") {
        message += "지각하였습니다."
      }

      await sendSMS(student.parentPhone, message)
    }
  }
}
