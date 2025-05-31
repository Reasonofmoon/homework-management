import type { Student, Assignment, Grade } from "./types"

// 학생별 성적 분석
export function analyzeStudentGrades(student: Student, grades: Grade[], assignments: Assignment[]) {
  // 학생의 성적 필터링
  const studentGrades = grades.filter((grade) => grade.studentId === student.id)

  if (studentGrades.length === 0) {
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      assignmentScores: [],
    }
  }

  // 성적 분석
  const totalAssignments = studentGrades.length
  const scores = studentGrades.map((grade) => ({
    score: grade.score,
    maxScore: grade.maxScore,
    percentage: (grade.score / grade.maxScore) * 100,
    assignmentId: grade.assignmentId,
  }))

  const percentages = scores.map((s) => s.percentage)
  const averageScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  const highestScore = Math.max(...percentages)
  const lowestScore = Math.min(...percentages)

  // 과제별 점수 정보
  const assignmentScores = scores.map((score) => {
    const assignment = assignments.find((a) => a.id === score.assignmentId)
    return {
      assignmentId: score.assignmentId,
      title: assignment?.title || "알 수 없는 과제",
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
    }
  })

  return {
    totalAssignments,
    completedAssignments: totalAssignments,
    averageScore,
    highestScore,
    lowestScore,
    assignmentScores,
  }
}

// 반별 성적 분석
export function analyzeClassGrades(className: string, students: Student[], grades: Grade[], assignments: Assignment[]) {
  // 해당 반 학생 필터링
  const classStudents = students.filter((student) => student.group === className && student.status === "active")

  if (classStudents.length === 0) {
    return {
      totalStudents: 0,
      averageScore: 0,
      highestAverage: 0,
      lowestAverage: 0,
      studentAverages: [],
    }
  }

  // 학생별 평균 점수 계산
  const studentAverages = classStudents.map((student) => {
    const analysis = analyzeStudentGrades(student, grades, assignments)
    return {
      studentId: student.id,
      name: student.name,
      averageScore: analysis.averageScore,
    }
  })

  // 반 전체 평균 계산
  const averages = studentAverages.map((s) => s.averageScore)
  const averageScore = averages.reduce((sum, avg) => sum + avg, 0) / averages.length
  const highestAverage = Math.max(...averages)
  const lowestAverage = Math.min(...averages)

  return {
    totalStudents: classStudents.length,
    averageScore,
    highestAverage,
    lowestAverage,
    studentAverages,
  }
}

// 과제별 성적 분석
export function analyzeAssignmentGrades(assignment: Assignment, grades: Grade[], students: Student[]) {
  // 해당 과제의 성적 필터링
  const assignmentGrades = grades.filter((grade) => grade.assignmentId === assignment.id)

  if (assignmentGrades.length === 0) {
    return {
      totalStudents: 0,
      submittedCount: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      studentScores: [],
    }
  }

  // 성적 분석
  const scores = assignmentGrades.map((grade) => ({
    score: grade.score,
    maxScore: grade.maxScore,
    percentage: (grade.score / grade.maxScore) * 100,
    studentId: grade.studentId,
  }))

  const percentages = scores.map((s) => s.percentage)
  const averageScore = percentages.reduce((sum, p) => sum + p, 0) / percentages.length
  const highestScore = Math.max(...percentages)
  const lowestScore = Math.min(...percentages)

  // 학생별 점수 정보
  const studentScores = scores.map((score) => {
    const student = students.find((s) => s.id === score.studentId)
    return {
      studentId: score.studentId,
      name: student?.name || "알 수 없는 학생",
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
    }
  })

  return {
    totalStudents: assignment.assignedTo.length,
    submittedCount: assignmentGrades.length,
    averageScore,
    highestScore,
    lowestScore,
    studentScores,
  }
}

// 주간 리포트 생성
export function generateWeeklyReport(
  students: Student[],
  assignments: Assignment[],
  grades: Grade[],
  attendances: { [key: string]: any }[],
) {
  // 이번 주의 시작일과 종료일 계산
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // 일요일로 설정
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // 토요일로 설정
  endOfWeek.setHours(23, 59, 59, 999)

  // 이번 주 과제 필터링
  const weeklyAssignments = assignments.filter((assignment) => {
    const dueDate = new Date(assignment.dueDate)
    return dueDate >= startOfWeek && dueDate <= endOfWeek
  })

  // 이번 주 출석 필터링
  const weeklyAttendances = attendances.filter((att) => {
    const date = new Date(att.date)
    return date >= startOfWeek && date <= endOfWeek
  })

  // 학생별 주간 리포트 생성
  const studentReports = students
    .filter((student) => student.status === "active")
    .map((student) => {
      // 학생에게 할당된 이번 주 과제
      const studentAssignments = weeklyAssignments.filter(
        (assignment) =>
          assignment.assignedTo.includes(student.name) ||
          assignment.assignedTo.includes("전체 학생") ||
          assignment.assignedTo.includes(student.group),
      )

      // 학생의 이번 주 성적
      const studentGrades = grades.filter(
        (grade) => grade.studentId === student.id && studentAssignments.some((a) => a.id === grade.assignmentId),
      )

      // 학생의 이번 주 출석
      const studentAttendances = weeklyAttendances.filter((att) => att.studentId === student.id)

      // 출석 통계
      const attendanceStats = {
        present: studentAttendances.filter((att) => att.status === "present").length,
        late: studentAttendances.filter((att) => att.status === "late").length,
        absent: studentAttendances.filter((att) => att.status === "absent").length,
        excused: studentAttendances.filter((att) => att.status === "excused").length,
      }

      // 과제 통계
      const assignmentStats = {
        total: studentAssignments.length,
        completed: studentGrades.length,
        pending: studentAssignments.length - studentGrades.length,
        averageScore:
          studentGrades.length > 0
            ? studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length
            : 0,
      }

      return {
        student,
        weekStart: startOfWeek.toISOString(),
        weekEnd: endOfWeek.toISOString(),
        attendanceStats,
        assignmentStats,
        assignments: studentAssignments.map((assignment) => {
          const grade = studentGrades.find((g) => g.assignmentId === assignment.id)
          return {
            assignment,
            status: grade ? "completed" : "pending",
            score: grade?.score,
            maxScore: grade?.maxScore,
            percentage: grade ? (grade.score / grade.maxScore) * 100 : 0,
          }
        }),
      }
    })

  return {
    weekStart: startOfWeek.toISOString(),
    weekEnd: endOfWeek.toISOString(),
    studentReports,
  }
}
