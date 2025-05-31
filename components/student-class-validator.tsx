"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, CheckCircle, Users, RefreshCw } from "lucide-react"
import { useClassStudentManagement } from "@/hooks/use-class-student-management"
import { useToast } from "@/hooks/use-toast"

interface ValidationIssue {
  type: "orphaned_student" | "empty_class" | "duplicate_name"
  severity: "error" | "warning" | "info"
  message: string
  studentId?: string
  className?: string
  action?: () => void
}

export function StudentClassValidator() {
  const { classes, students, getStudentsByClass, cleanupOrphanedStudents, validateStudentClass } =
    useClassStudentManagement()
  const { toast } = useToast()
  const [issues, setIssues] = useState<ValidationIssue[]>([])
  const [isValidating, setIsValidating] = useState(false)

  const validateData = () => {
    setIsValidating(true)
    const foundIssues: ValidationIssue[] = []

    // Check for orphaned students (assigned to non-existent classes)
    students.forEach((student) => {
      if (!validateStudentClass(student.group)) {
        foundIssues.push({
          type: "orphaned_student",
          severity: "error",
          message: `학생 "${student.name}"이(가) 존재하지 않는 반 "${student.group}"에 배정되어 있습니다.`,
          studentId: student.id,
          className: student.group,
        })
      }
    })

    // Check for empty classes
    classes.forEach((classGroup) => {
      const studentsInClass = getStudentsByClass(classGroup.name)
      if (studentsInClass.length === 0) {
        foundIssues.push({
          type: "empty_class",
          severity: "warning",
          message: `"${classGroup.name}" 반에 배정된 학생이 없습니다.`,
          className: classGroup.name,
        })
      }
    })

    // Check for duplicate student names within the same class
    classes.forEach((classGroup) => {
      const studentsInClass = getStudentsByClass(classGroup.name)
      const nameGroups = studentsInClass.reduce(
        (acc, student) => {
          const name = student.name.toLowerCase().trim()
          if (!acc[name]) acc[name] = []
          acc[name].push(student)
          return acc
        },
        {} as Record<string, typeof studentsInClass>,
      )

      Object.entries(nameGroups).forEach(([name, duplicates]) => {
        if (duplicates.length > 1) {
          foundIssues.push({
            type: "duplicate_name",
            severity: "warning",
            message: `"${classGroup.name}" 반에 "${duplicates[0].name}" 이름의 학생이 ${duplicates.length}명 있습니다.`,
            className: classGroup.name,
          })
        }
      })
    })

    setIssues(foundIssues)
    setIsValidating(false)
  }

  const fixOrphanedStudents = () => {
    const movedCount = cleanupOrphanedStudents()
    if (movedCount > 0) {
      toast({
        title: "문제 해결 완료",
        description: `${movedCount}명의 학생이 유효한 반으로 이동되었습니다.`,
      })
      validateData() // Re-validate after fixing
    }
  }

  useEffect(() => {
    validateData()
  }, [students, classes])

  const getIssueIcon = (severity: ValidationIssue["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getIssueVariant = (severity: ValidationIssue["severity"]) => {
    switch (severity) {
      case "error":
        return "destructive" as const
      case "warning":
        return "default" as const
      case "info":
        return "default" as const
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              데이터 무결성 검사
            </CardTitle>
            <CardDescription>반과 학생 배정의 데이터 무결성을 확인하고 문제를 해결합니다.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={validateData} disabled={isValidating}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isValidating ? "animate-spin" : ""}`} />
            다시 검사
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {issues.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>모든 데이터가 정상입니다. 발견된 문제가 없습니다.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="destructive">오류: {issues.filter((i) => i.severity === "error").length}</Badge>
                <Badge variant="secondary">경고: {issues.filter((i) => i.severity === "warning").length}</Badge>
              </div>
              {issues.some((i) => i.type === "orphaned_student") && (
                <Button size="sm" onClick={fixOrphanedStudents}>
                  고아 학생 문제 해결
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {issues.map((issue, index) => (
                <Alert key={index} variant={getIssueVariant(issue.severity)}>
                  <div className="flex items-start gap-2">
                    {getIssueIcon(issue.severity)}
                    <AlertDescription className="flex-1">{issue.message}</AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>

            {/* Detailed breakdown */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>반 이름</TableHead>
                    <TableHead>학생 수</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((classGroup) => {
                    const studentsInClass = getStudentsByClass(classGroup.name)
                    const hasIssues = issues.some((i) => i.className === classGroup.name)

                    return (
                      <TableRow key={classGroup.id}>
                        <TableCell className="font-medium">{classGroup.name}</TableCell>
                        <TableCell>
                          <Badge variant={studentsInClass.length === 0 ? "secondary" : "default"}>
                            {studentsInClass.length}명
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasIssues ? (
                            <Badge variant="destructive">문제 있음</Badge>
                          ) : (
                            <Badge variant="default">정상</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
