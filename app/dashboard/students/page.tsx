"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Plus, Upload, Edit, FileText } from "lucide-react"
import { GoogleSheetsImport } from "@/components/google-sheets-import"
import { StudentHomeworkStatus } from "@/components/student-homework-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useClasses } from "@/hooks/use-classes"
import { ClassManagement } from "@/components/class-management"

// 학생 데이터 타입 정의
interface Student {
  id: string
  name: string
  group: string
  status: "active" | "inactive"
  completionRate: number
}

export default function StudentsPage() {
  // 초기 학생 데이터
  const initialStudents: Student[] = [
    { id: "1", name: "김온유", group: "A반", status: "active", completionRate: 75 },
    { id: "2", name: "김석준", group: "A반", status: "active", completionRate: 60 },
    { id: "3", name: "김승준", group: "A반", status: "active", completionRate: 85 },
    { id: "4", name: "오예원", group: "B반", status: "active", completionRate: 90 },
    { id: "5", name: "신아민", group: "B반", status: "active", completionRate: 70 },
    { id: "6", name: "홍주연", group: "B반", status: "active", completionRate: 80 },
  ]

  const [students, setStudents] = useLocalStorage<Student[]>("students", initialStudents)
  const [searchTerm, setSearchTerm] = useState("")
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showHomeworkDialog, setShowHomeworkDialog] = useState(false)
  const [newStudent, setNewStudent] = useState({ name: "", group: "A반" })
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const { classes } = useClasses()

  // 학생 검색 필터링
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.group.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 새 학생 추가
  const addStudent = () => {
    if (newStudent.name.trim() === "") return

    const newId = (students.length + 1).toString()
    setStudents([
      ...students,
      {
        id: newId,
        name: newStudent.name,
        group: newStudent.group,
        status: "active",
        completionRate: 0,
      },
    ])

    setNewStudent({ name: "", group: "A반" })
    setShowAddDialog(false)
  }

  // 학생 정보 수정
  const editStudent = () => {
    if (!editingStudent || editingStudent.name.trim() === "") return

    setStudents(students.map((student) => (student.id === editingStudent.id ? editingStudent : student)))
    setShowEditDialog(false)
  }

  // 학생 상태 변경
  const toggleStudentStatus = (id: string) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status: student.status === "active" ? "inactive" : "active" } : student,
      ),
    )
  }

  // 학생 삭제
  const deleteStudent = (id: string) => {
    if (confirm("정말로 이 학생을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setStudents(students.filter((student) => student.id !== id))
    }
  }

  // Google Sheets에서 가져온 데이터 처리
  const handleImportedData = (importedStudents: Student[]) => {
    // 기존 학생 ID와 충돌하지 않도록 새 ID 할당
    const maxId = Math.max(...students.map((s) => Number.parseInt(s.id)), 0)
    const newStudents = importedStudents.map((student, index) => ({
      ...student,
      id: (maxId + index + 1).toString(),
      completionRate: 0, // 초기 완료율 설정
    }))

    // 중복 학생 처리 (이름과 반이 동일한 경우 중복으로 간주)
    const mergedStudents = [...students]

    newStudents.forEach((newStudent) => {
      const existingIndex = mergedStudents.findIndex((s) => s.name === newStudent.name && s.group === newStudent.group)

      if (existingIndex >= 0) {
        // 기존 학생 정보 업데이트
        mergedStudents[existingIndex] = {
          ...mergedStudents[existingIndex],
          status: newStudent.status,
        }
      } else {
        // 새 학생 추가
        mergedStudents.push(newStudent)
      }
    })

    setStudents(mergedStudents)
    setShowImportDialog(false)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">학생 관리</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Upload className="mr-2 h-4 w-4" />
                구글 시트 가져오기
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>구글 시트에서 학생 명단 가져오기</DialogTitle>
                <DialogDescription>구글 시트에서 학생 명단을 가져와 시스템에 등록합니다.</DialogDescription>
              </DialogHeader>
              <GoogleSheetsImport onImportSuccess={handleImportedData} />
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <Plus className="mr-2 h-4 w-4" />
                학생 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>새 학생 추가</DialogTitle>
                <DialogDescription>새로운 학생 정보를 입력하여 시스템에 등록합니다.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="group">반</Label>
                  <Select
                    value={newStudent.group}
                    onValueChange={(value) => setNewStudent({ ...newStudent, group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="반 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classGroup) => (
                        <SelectItem key={classGroup.id} value={classGroup.name}>
                          {classGroup.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  취소
                </Button>
                <Button onClick={addStudent}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학생 목록</CardTitle>
          <CardDescription>시스템에 등록된 전체 학생 목록입니다. 검색 및 필터링이 가능합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
            <Input
              placeholder="학생 이름 또는 반으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>반</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>숙제 완료율</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.group}</TableCell>
                    <TableCell>
                      <Badge
                        variant={student.status === "active" ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleStudentStatus(student.id)}
                      >
                        {student.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell>{student.completionRate}%</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">메뉴 열기</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>작업</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingStudent(student)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            학생 정보 수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowHomeworkDialog(true)
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            숙제 현황 보기
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteStudent(student.id)}>
                            학생 삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>반 관리</CardTitle>
          <CardDescription>학생들을 그룹화하기 위한 반을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClassManagement />
        </CardContent>
      </Card>

      {/* 학생 정보 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>학생 정보 수정</DialogTitle>
            <DialogDescription>학생 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">이름</Label>
                <Input
                  id="edit-name"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  placeholder="학생 이름"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-group">반</Label>
                <Select
                  value={editingStudent.group}
                  onValueChange={(value) => setEditingStudent({ ...editingStudent, group: value })}
                >
                  <SelectTrigger id="edit-group">
                    <SelectValue placeholder="반 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classGroup) => (
                      <SelectItem key={classGroup.id} value={classGroup.name}>
                        {classGroup.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select
                  value={editingStudent.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingStudent({ ...editingStudent, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">활성</SelectItem>
                    <SelectItem value="inactive">비활성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={editStudent}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 학생 숙제 현황 다이얼로그 */}
      <Dialog open={showHomeworkDialog} onOpenChange={setShowHomeworkDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.name} 학생의 숙제 현황</DialogTitle>
            <DialogDescription>{selectedStudent?.group} 소속 학생의 숙제 진행 상황입니다.</DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="current">현재 숙제</TabsTrigger>
                <TabsTrigger value="completed">완료된 숙제</TabsTrigger>
                <TabsTrigger value="all">전체 숙제</TabsTrigger>
              </TabsList>
              <TabsContent value="current" className="space-y-4 mt-4">
                <StudentHomeworkStatus studentId={selectedStudent.id} status="active" />
              </TabsContent>
              <TabsContent value="completed" className="space-y-4 mt-4">
                <StudentHomeworkStatus studentId={selectedStudent.id} status="completed" />
              </TabsContent>
              <TabsContent value="all" className="space-y-4 mt-4">
                <StudentHomeworkStatus studentId={selectedStudent.id} status="all" />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

