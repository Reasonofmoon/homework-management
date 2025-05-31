"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useToast } from "@/hooks/use-toast"
import type { Student, Assignment, Grade } from "@/lib/types"
import { analyzeStudentGrades, analyzeClassGrades, analyzeAssignmentGrades } from "@/lib/analytics"
import { BarChart3, Download, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react"
import { runGradeAnalysis } from "@/lib/google-sheets"

export function GradeAnalytics() {
  const [students] = useLocalStorage<Student[]>("students", [])
  const [assignments] = useLocalStorage<Assignment[]>("assignments", [])
  const [grades] = useLocalStorage<Grade[]>("grades", [])
  const [selectedStudent, setSelectedStudent] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedAssignment, setSelectedAssignment] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // 학생 분석 결과
  const [studentAnalysis, setStudentAnalysis] = useState<any>(null)
  // 반 분석 결과
  const [classAnalysis, setClassAnalysis] = useState<any>(null)
  // 과제 분석 결과
  const [assignmentAnalysis, setAssignmentAnalysis] = useState<any>(null)

  // 반 목록
  const classes = [...new Set(students.map((student) => student.group))].sort()

  // 선택된 학생이 변경되면 분석 실행
  useEffect(() => {
    if (selectedStudent) {
      const student = students.find((s) => s.id === selectedStudent)
      if (student) {
        const analysis = analyzeStudentGrades(student, grades, assignments)
        setStudentAnalysis(analysis)
      }
    }
  }, [selectedStudent, students, grades, assignments])

  // 선택된 반이 변경되면 분석 실행
  useEffect(() => {
    if (selectedClass) {
      const analysis = analyzeClassGrades(selectedClass, students, grades, assignments)
      setClassAnalysis(analysis)
    }
  }, [selectedClass, students, grades, assignments])

  // 선택된 과제가 변경되면 분석 실행
  useEffect(() => {
    if (selectedAssignment) {
      const assignment = assignments.find((a) => a.id === selectedAssignment)
      if (assignment) {
        const analysis = analyzeAssignmentGrades(assignment, grades, students)
        setAssignmentAnalysis(analysis)
      }
    }
  }, [selectedAssignment, assignments, grades, students])

  // Google Sheets에서 성적 분석 실행
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)

    try {
      const sheetId = localStorage.getItem("googleSheetsId")
      if (!sheetId) {
        throw new Error("Google Sheets ID가 설정되지 않았습니다.")
      }

      await runGradeAnalysis(sheetId)

      toast({
        title: "성적 분석 완료",
        description: "Google Sheets에서 성적 분석이 성공적으로 실행되었습니다.",
      })
    } catch (error) {
      console.error("성적 분석 중 오류 발생:", error)
      toast({
        title: "성적 분석 실패",
        description: "Google Sheets에서 성적 분석을 실행하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 성적 데이터 내보내기
  const handleExportData = () => {
    setIsExporting(true)

    try {
      // 내보낼 데이터 준비
      const exportData = {
        students,
        assignments,
        grades,
        studentAnalysis,
        classAnalysis,
        assignmentAnalysis,
        exportDate: new Date().toISOString(),
      }

      // JSON 파일로 내보내기
      const jsonData = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `grade-analytics-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "데이터 내보내기 완료",
        description: "성적 분석 데이터가 성공적으로 내보내기 되었습니다.",
      })
    } catch (error) {
      console.error("데이터 내보내기 중 오류 발생:", error)
      toast({
        title: "데이터 내보내기 실패",
        description: "성적 분석 데이터를 내보내는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle>성적 분석</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRunAnalysis} disabled={isAnalyzing}>
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Google Sheets 분석 실행
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportData} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              데이터 내보내기
            </Button>
          </div>
        </div>
        <CardDescription>학생, 반, 과제별 성적 분석 및 통계</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="student" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="student">학생별 분석</TabsTrigger>
            <TabsTrigger value="class">반별 분석</TabsTrigger>
            <TabsTrigger value="assignment">과제별 분석</TabsTrigger>
          </TabsList>

          <TabsContent value="student" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="student-select" className="text-sm font-medium">
                  학생 선택
                </label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student-select">
                    <SelectValue placeholder="학생을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {students
                      .filter((student) => student.status === "active")
                      .map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name} ({student.group})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && studentAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">평균 점수</div>
                      <div className="text-2xl font-bold">{studentAnalysis.averageScore.toFixed(1)}%</div>
                      <Progress value={studentAnalysis.averageScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">완료한 과제</div>
                      <div className="text-2xl font-bold">
                        {studentAnalysis.completedAssignments} / {studentAnalysis.totalAssignments}
                      </div>
                      <Progress
                        value={
                          studentAnalysis.totalAssignments > 0
                            ? (studentAnalysis.completedAssignments / studentAnalysis.totalAssignments) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">과제별 점수</div>
                    <div className="space-y-3">
                      {studentAnalysis.assignmentScores.map((score: any, index: number) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{score.title}</span>
                            <span className="text-sm font-medium">
                              {score.score} / {score.maxScore} ({score.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <Progress value={score.percentage} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  {selectedStudent ? "이 학생의 성적 데이터가 없습니다." : "학생을 선택하여 성적 분석을 확인하세요."}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="class" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="class-select" className="text-sm font-medium">
                  반 선택
                </label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class-select">
                    <SelectValue placeholder="반을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((className) => (
                      <SelectItem key={className} value={className}>
                        {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedClass && classAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">반 평균 점수</div>
                      <div className="text-2xl font-bold">{classAnalysis.averageScore.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">최고 평균</div>
                      <div className="text-2xl font-bold">{classAnalysis.highestAverage.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">최저 평균</div>
                      <div className="text-2xl font-bold">{classAnalysis.lowestAverage.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">학생별 평균 점수</div>
                    <div className="space-y-3">
                      {classAnalysis.studentAverages
                        .sort((a: any, b: any) => b.averageScore - a.averageScore)
                        .map((student: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{student.name}</span>
                              <span className="text-sm font-medium">{student.averageScore.toFixed(1)}%</span>
                            </div>
                            <Progress value={student.averageScore} className="h-1.5" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  {selectedClass ? "이 반의 성적 데이터가 없습니다." : "반을 선택하여 성적 분석을 확인하세요."}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="assignment-select" className="text-sm font-medium">
                  과제 선택
                </label>
                <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                  <SelectTrigger id="assignment-select">
                    <SelectValue placeholder="과제를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedAssignment && assignmentAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">평균 점수</div>
                      <div className="text-2xl font-bold">{assignmentAnalysis.averageScore.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">제출률</div>
                      <div className="text-2xl font-bold">
                        {assignmentAnalysis.submittedCount} / {assignmentAnalysis.totalStudents}(
                        {assignmentAnalysis.totalStudents > 0
                          ? ((assignmentAnalysis.submittedCount / assignmentAnalysis.totalStudents) * 100).toFixed(1)
                          : 0}
                        %)
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">점수 범위</div>
                      <div className="text-2xl font-bold">
                        {assignmentAnalysis.lowestScore.toFixed(1)}% - {assignmentAnalysis.highestScore.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium">학생별 점수</div>
                    <div className="space-y-3">
                      {assignmentAnalysis.studentScores
                        .sort((a: any, b: any) => b.percentage - a.percentage)
                        .map((score: any, index: number) => (
                          <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">{score.name}</span>
                              <span className="text-sm font-medium">
                                {score.score} / {score.maxScore} ({score.percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <Progress value={score.percentage} className="h-1.5" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  {selectedAssignment ? "이 과제의 성적 데이터가 없습니다." : "과제를 선택하여 성적 분석을 확인하세요."}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <a
          href="https://docs.google.com/spreadsheets"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline flex items-center"
        >
          <FileSpreadsheet className="mr-1 h-4 w-4" />
          Google Sheets에서 보기
        </a>
      </CardFooter>
    </Card>
  )
}
