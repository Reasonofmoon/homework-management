"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string // ISO date string
  assignedTo: string[]
  status: "active" | "completed"
}

interface StudentAssignment extends Assignment {
  studentStatus: "pending" | "in-progress" | "completed"
}

interface StudentHomeworkStatusProps {
  studentId: string
  status: "active" | "completed" | "all"
}

export function StudentHomeworkStatus({ studentId, status }: StudentHomeworkStatusProps) {
  // 초기 숙제 데이터
  const initialAssignments: Assignment[] = [
    {
      id: "1",
      title: "Dragon Masters 5권 챕터 1-5 읽기",
      description: "Dragon Masters 5권의 챕터 1부터 5까지 읽고 내용 요약하기",
      dueDate: new Date(2025, 2, 27).toISOString(), // 2025년 3월 27일
      assignedTo: ["전체 학생"],
      status: "active",
    },
    {
      id: "2",
      title: "퀴즐릿 연습",
      description: "퀴즐릿 앱에서 이번 주 단어 학습하기",
      dueDate: new Date(2025, 2, 27).toISOString(), // 2025년 3월 27일
      assignedTo: ["전체 학생"],
      status: "active",
    },
    {
      id: "3",
      title: "어휘 501-525",
      description: "어휘 501-525 학습 및 암기",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김온유"],
      status: "active",
    },
    {
      id: "4",
      title: "어휘 751-775 스펠링",
      description: "어휘 751-775 스펠링 연습",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김석준"],
      status: "active",
    },
  ]

  // 학생별 숙제 상태 데이터
  const initialStudentAssignments: Record<string, Record<string, "pending" | "in-progress" | "completed">> = {
    "1": { "1": "in-progress", "2": "completed" },
    "2": { "2": "in-progress", "4": "pending" },
    "3": { "1": "completed", "2": "completed" },
  }

  const [assignments, setAssignments] = useLocalStorage<Assignment[]>("assignments", initialAssignments)
  const [studentAssignments, setStudentAssignments] = useLocalStorage<
    Record<string, Record<string, "pending" | "in-progress" | "completed">>
  >("studentAssignments", initialStudentAssignments)

  const [studentName, setStudentName] = useState("")

  // 학생 이름 가져오기
  useEffect(() => {
    const storedStudents = localStorage.getItem("students")
    if (storedStudents) {
      const students = JSON.parse(storedStudents)
      const student = students.find((s: any) => s.id === studentId)
      if (student) {
        setStudentName(student.name)
      }
    }
  }, [studentId])

  // 학생에게 할당된 숙제 필터링
  const filteredAssignments = assignments.filter((assignment) => {
    // 상태 필터링
    if (status !== "all" && assignment.status !== status) {
      return false
    }

    // 학생에게 할당된 숙제만 표시
    return assignment.assignedTo.includes("전체 학생") || assignment.assignedTo.includes(studentName)
  })

  // 학생별 숙제 상태 업데이트
  const updateAssignmentStatus = (assignmentId: string, newStatus: "pending" | "in-progress" | "completed") => {
    const studentAssignmentsCopy = { ...studentAssignments }

    if (!studentAssignmentsCopy[studentId]) {
      studentAssignmentsCopy[studentId] = {}
    }

    studentAssignmentsCopy[studentId][assignmentId] = newStatus
    setStudentAssignments(studentAssignmentsCopy)

    // 학생의 전체 완료율 업데이트
    updateStudentCompletionRate()
  }

  // 학생의 전체 완료율 계산 및 업데이트
  const updateStudentCompletionRate = () => {
    const storedStudents = localStorage.getItem("students")
    if (!storedStudents) return

    const students = JSON.parse(storedStudents)
    const studentAssignmentIds = Object.keys(studentAssignments[studentId] || {})

    if (studentAssignmentIds.length === 0) return

    const completedCount = studentAssignmentIds.filter((id) => studentAssignments[studentId][id] === "completed").length

    const completionRate = Math.round((completedCount / studentAssignmentIds.length) * 100)

    const updatedStudents = students.map((student: any) =>
      student.id === studentId ? { ...student, completionRate } : student,
    )

    localStorage.setItem("students", JSON.stringify(updatedStudents))
  }

  // 학생 숙제 상태에 따른 배지 색상
  const getStatusBadgeVariant = (assignmentId: string) => {
    if (!studentAssignments[studentId] || !studentAssignments[studentId][assignmentId]) {
      return "outline"
    }

    const status = studentAssignments[studentId][assignmentId]
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "secondary"
      case "pending":
      default:
        return "outline"
    }
  }

  // 학생 숙제 상태에 따른 텍스트
  const getStatusText = (assignmentId: string) => {
    if (!studentAssignments[studentId] || !studentAssignments[studentId][assignmentId]) {
      return "미시작"
    }

    const status = studentAssignments[studentId][assignmentId]
    switch (status) {
      case "completed":
        return "완료"
      case "in-progress":
        return "진행 중"
      case "pending":
      default:
        return "미시작"
    }
  }

  return (
    <div className="space-y-4">
      {filteredAssignments.length > 0 ? (
        filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{assignment.title}</h3>
                  <Badge variant={getStatusBadgeVariant(assignment.id)}>{getStatusText(assignment.id)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  마감일: {format(new Date(assignment.dueDate), "yyyy년 MM월 dd일", { locale: ko })}
                </p>
              </div>
              <div className="p-4 bg-muted/20">
                <p className="text-sm font-medium mb-2">진행 상태 업데이트</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`pending-${assignment.id}`}
                      checked={
                        !studentAssignments[studentId] ||
                        !studentAssignments[studentId][assignment.id] ||
                        studentAssignments[studentId][assignment.id] === "pending"
                      }
                      onCheckedChange={() => updateAssignmentStatus(assignment.id, "pending")}
                    />
                    <Label htmlFor={`pending-${assignment.id}`}>미시작</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`in-progress-${assignment.id}`}
                      checked={
                        studentAssignments[studentId] && studentAssignments[studentId][assignment.id] === "in-progress"
                      }
                      onCheckedChange={() => updateAssignmentStatus(assignment.id, "in-progress")}
                    />
                    <Label htmlFor={`in-progress-${assignment.id}`}>진행 중</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`completed-${assignment.id}`}
                      checked={
                        studentAssignments[studentId] && studentAssignments[studentId][assignment.id] === "completed"
                      }
                      onCheckedChange={() => updateAssignmentStatus(assignment.id, "completed")}
                    />
                    <Label htmlFor={`completed-${assignment.id}`}>완료</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          {status === "active"
            ? "현재 진행 중인 숙제가 없습니다."
            : status === "completed"
              ? "완료된 숙제가 없습니다."
              : "할당된 숙제가 없습니다."}
        </div>
      )}
    </div>
  )
}

