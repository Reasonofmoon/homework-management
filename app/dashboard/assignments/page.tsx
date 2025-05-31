"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarIcon,
  Copy,
  Plus,
  Trash2,
  MoreHorizontal,
  Clock,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Pencil,
  X,
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { motion } from "@/components/ui/motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useClasses } from "@/hooks/use-classes"
import { useMemo } from "react"

// 숙제 데이터 타입 정의
interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string // ISO date string
  assignedTo: string[]
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
}

// 학생 그룹 데이터
// const studentGroups = [
//  {
//    name: "A반",
//    students: ["김온유", "김석준", "김승준"],
//  },
//  {
//    name: "B반",
//    students: ["오예원", "신아민", "홍주연"],
//  },
// ]

export default function AssignmentsPage() {
  // 초기 숙제 데이터
  const initialAssignments: Assignment[] = [
    {
      id: "1",
      title: "Dragon Masters 5권 챕터 1-5 읽기",
      description: "Dragon Masters 5권의 챕터 1부터 5까지 읽고 내용 요약하기",
      dueDate: new Date(2025, 2, 27).toISOString(), // 2025년 3월 27일
      assignedTo: ["전체 학생"],
      status: "todo",
      priority: "medium",
    },
    {
      id: "2",
      title: "퀴즐릿 연습",
      description: "퀴즐릿 앱에서 이번 주 단어 학습하기",
      dueDate: new Date(2025, 2, 27).toISOString(), // 2025년 3월 27일
      assignedTo: ["전체 학생"],
      status: "in-progress",
      priority: "high",
    },
    {
      id: "3",
      title: "어휘 시험 준비",
      description: "어휘 시험 준비 및 복습",
      dueDate: new Date(2025, 2, 29).toISOString(), // 2025년 3월 29일
      assignedTo: ["A반"],
      status: "todo",
      priority: "high",
    },
    {
      id: "4",
      title: "소리 모닝 완료",
      description: "소리 모닝 학습 완료하기",
      dueDate: new Date(2025, 2, 31).toISOString(), // 2025년 3월 31일
      assignedTo: ["B반"],
      status: "completed",
      priority: "medium",
    },
    {
      id: "5",
      title: "어휘 501-525",
      description: "어휘 501-525 학습 및 암기",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김온유"],
      status: "in-progress",
      priority: "medium",
    },
    {
      id: "6",
      title: "어휘 751-775 스펠링",
      description: "어휘 751-775 스펠링 연습",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김석준"],
      status: "completed",
      priority: "low",
    },
  ]

  const [assignments, setAssignments] = useLocalStorage<Assignment[]>("assignments", initialAssignments)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newAssignment, setNewAssignment] = useState<Omit<Assignment, "id">>({
    title: "",
    description: "",
    dueDate: new Date().toISOString(),
    assignedTo: [],
    status: "todo",
    priority: "medium",
  })
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null)
  const [bulkAssignText, setBulkAssignText] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string>("all")
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [draggedAssignment, setDraggedAssignment] = useState<Assignment | null>(null)

  const { classes } = useClasses()
  const [students] = useLocalStorage<any[]>("students", [])

  // Create a dynamic studentGroups based on classes and students
  const studentGroups = useMemo(() => {
    return classes.map((classGroup) => ({
      name: classGroup.name,
      students: students
        .filter((student) => student.group === classGroup.name && student.status === "active")
        .map((student) => student.name),
    }))
  }, [classes, students])

  // 드래그 앤 드롭 참조
  const draggedItemRef = useRef<HTMLDivElement | null>(null)
  const dragOverItemRef = useRef<string | null>(null)

  // 숙제 검색 및 필터링
  const filteredAssignments = assignments.filter((assignment) => {
    // 검색어 필터링
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase())

    // 우선순위 필터링
    const matchesPriority = filterPriority === "all" || assignment.priority === filterPriority

    // 할당자 필터링
    let matchesAssignee = true
    if (filterAssignee !== "all") {
      if (filterAssignee === "전체 학생") {
        matchesAssignee = assignment.assignedTo.includes("전체 학생")
      } else {
        matchesAssignee = assignment.assignedTo.includes(filterAssignee)
      }
    }

    return matchesSearch && matchesPriority && matchesAssignee
  })

  // 상태별 숙제 그룹화
  const todoAssignments = filteredAssignments.filter((a) => a.status === "todo")
  const inProgressAssignments = filteredAssignments.filter((a) => a.status === "in-progress")
  const completedAssignments = filteredAssignments.filter((a) => a.status === "completed")

  // 새 숙제 추가
  const addAssignment = () => {
    if (newAssignment.title.trim() === "" || selectedStudents.length === 0) return

    const newId = (assignments.length + 1).toString()
    setAssignments([
      ...assignments,
      {
        id: newId,
        ...newAssignment,
        assignedTo: selectedStudents,
      },
    ])

    // 폼 초기화
    setNewAssignment({
      title: "",
      description: "",
      dueDate: new Date().toISOString(),
      assignedTo: [],
      status: "todo",
      priority: "medium",
    })
    setShowAddDialog(false)
  }

  // 숙제 수정
  const updateAssignment = () => {
    if (!editingAssignment || editingAssignment.title.trim() === "") return

    setAssignments(
      assignments.map((assignment) => (assignment.id === editingAssignment.id ? editingAssignment : assignment)),
    )
    setShowEditDialog(false)
  }

  // 숙제 삭제
  const deleteAssignment = (id: string) => {
    if (confirm("정말로 이 숙제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      setAssignments(assignments.filter((assignment) => assignment.id !== id))
    }
  }

  // 숙제 복제
  const duplicateAssignment = (assignment: Assignment) => {
    const newId = (assignments.length + 1).toString()
    const duplicated: Assignment = {
      ...assignment,
      id: newId,
      title: `${assignment.title} (복사본)`,
    }
    setAssignments([...assignments, duplicated])
  }

  // 학생 그룹 변경 시 학생 목록 업데이트
  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)

    if (value === "all") {
      setSelectedStudents(["전체 학생"])
    } else if (value === "none") {
      setSelectedStudents([])
    } else {
      const group = studentGroups.find((g) => g.name === value)
      if (group) {
        setSelectedStudents(group.students)
      }
    }
  }

  // 학생 선택 토글
  const toggleStudent = (student: string) => {
    if (selectedStudents.includes(student)) {
      setSelectedStudents(selectedStudents.filter((s) => s !== student))
    } else {
      setSelectedStudents([...selectedStudents, student])
    }
  }

  // 드래그 시작 핸들러
  const handleDragStart = (e: React.DragEvent, assignment: Assignment) => {
    setDraggedAssignment(assignment)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.classList.add("opacity-50")
      draggedItemRef.current = e.currentTarget
    }
    // 드래그 이미지 설정 (투명하게)
    const img = new Image()
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  // 드래그 종료 핸들러
  const handleDragEnd = (e: React.DragEvent) => {
    if (draggedItemRef.current) {
      draggedItemRef.current.classList.remove("opacity-50")
    }
    setDraggedAssignment(null)
    draggedItemRef.current = null
    dragOverItemRef.current = null
  }

  // 드래그 오버 핸들러
  const handleDragOver = (e: React.DragEvent, status: "todo" | "in-progress" | "completed") => {
    e.preventDefault()
    dragOverItemRef.current = status
  }

  // 드롭 핸들러
  const handleDrop = (e: React.DragEvent, status: "todo" | "in-progress" | "completed") => {
    e.preventDefault()

    if (draggedAssignment && draggedAssignment.status !== status) {
      // 상태 업데이트
      const updatedAssignments = assignments.map((assignment) =>
        assignment.id === draggedAssignment.id ? { ...assignment, status } : assignment,
      )
      setAssignments(updatedAssignments)
    }
  }

  // 우선순위에 따른 배지 색상
  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">높음</Badge>
      case "medium":
        return <Badge variant="default">중간</Badge>
      case "low":
        return <Badge variant="secondary">낮음</Badge>
    }
  }

  // 할당 대상 목록 (필터용)
  // const assigneeOptions = ["전체 학생", "A반", "B반", "C반"]
  const assigneeOptions = ["전체 학생", ...classes.map((c) => c.name)]
    .concat(studentGroups.flatMap((g) => g.students))
    .filter((value, index, self) => self.indexOf(value) === index) // 중복 제거

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">숙제 관리</h2>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="숙제 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px] pl-8"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1">
                <Filter className="h-4 w-4" />
                필터
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>필터 옵션</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">우선순위</DropdownMenuLabel>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterPriority === "all" && "bg-primary/10 font-medium")}
                onClick={() => setFilterPriority("all")}
              >
                <span className={cn("h-2 w-2 rounded-full", filterPriority === "all" ? "bg-primary" : "bg-muted")} />
                모든 우선순위
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterPriority === "high" && "bg-primary/10 font-medium")}
                onClick={() => setFilterPriority("high")}
              >
                <span className="h-2 w-2 rounded-full bg-red-500" />
                높음
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterPriority === "medium" && "bg-primary/10 font-medium")}
                onClick={() => setFilterPriority("medium")}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                중간
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterPriority === "low" && "bg-primary/10 font-medium")}
                onClick={() => setFilterPriority("low")}
              >
                <span className="h-2 w-2 rounded-full bg-gray-500" />
                낮음
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">
                할당 대상
              </DropdownMenuLabel>
              <ScrollArea className="h-[200px]">
                <DropdownMenuItem
                  className={cn("gap-2 cursor-pointer", filterAssignee === "all" && "bg-primary/10 font-medium")}
                  onClick={() => setFilterAssignee("all")}
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  모든 대상
                </DropdownMenuItem>

                {assigneeOptions.map((assignee) => (
                  <DropdownMenuItem
                    key={assignee}
                    className={cn("gap-2 cursor-pointer", filterAssignee === assignee && "bg-primary/10 font-medium")}
                    onClick={() => setFilterAssignee(assignee)}
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {assignee}
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="sm" className="h-9" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            숙제 추가
          </Button>
        </div>
      </div>

      {/* 칸반 보드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 할 일 열 */}
        <div className="space-y-4" onDragOver={(e) => handleDragOver(e, "todo")} onDrop={(e) => handleDrop(e, "todo")}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>할 일
              <Badge variant="outline" className="ml-2">
                {todoAssignments.length}
              </Badge>
            </h3>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-2">
              {todoAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, assignment)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{assignment.title}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">메뉴 열기</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingAssignment(assignment)
                              setShowEditDialog(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => duplicateAssignment(assignment)}>
                            <Copy className="mr-2 h-4 w-4" />
                            복제하기
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => deleteAssignment(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(assignment.dueDate), "MM/dd", { locale: ko })}
                      </div>
                      {getPriorityBadge(assignment.priority)}
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {assignment.assignedTo.length > 1
                          ? `${assignment.assignedTo[0]} 외 ${assignment.assignedTo.length - 1}명`
                          : assignment.assignedTo[0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {todoAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-20 border border-dashed rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">할 일이 없습니다</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 진행 중 열 */}
        <div
          className="space-y-4"
          onDragOver={(e) => handleDragOver(e, "in-progress")}
          onDrop={(e) => handleDrop(e, "in-progress")}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              진행 중
              <Badge variant="outline" className="ml-2">
                {inProgressAssignments.length}
              </Badge>
            </h3>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-2">
              {inProgressAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, assignment)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{assignment.title}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">메뉴 열기</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingAssignment(assignment)
                              setShowEditDialog(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => duplicateAssignment(assignment)}>
                            <Copy className="mr-2 h-4 w-4" />
                            복제하기
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => deleteAssignment(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(assignment.dueDate), "MM/dd", { locale: ko })}
                      </div>
                      {getPriorityBadge(assignment.priority)}
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {assignment.assignedTo.length > 1
                          ? `${assignment.assignedTo[0]} 외 ${assignment.assignedTo.length - 1}명`
                          : assignment.assignedTo[0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {inProgressAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-20 border border-dashed rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">진행 중인 숙제가 없습니다</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* 완료 열 */}
        <div
          className="space-y-4"
          onDragOver={(e) => handleDragOver(e, "completed")}
          onDrop={(e) => handleDrop(e, "completed")}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              완료
              <Badge variant="outline" className="ml-2">
                {completedAssignments.length}
              </Badge>
            </h3>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-2">
              {completedAssignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-gray-950 shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, assignment)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">{assignment.title}</h4>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">메뉴 열기</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => {
                              setEditingAssignment(assignment)
                              setShowEditDialog(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => duplicateAssignment(assignment)}>
                            <Copy className="mr-2 h-4 w-4" />
                            복제하기
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => deleteAssignment(assignment.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(assignment.dueDate), "MM/dd", { locale: ko })}
                      </div>
                      {getPriorityBadge(assignment.priority)}
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-muted/20 flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {assignment.assignedTo.length > 1
                          ? `${assignment.assignedTo[0]} 외 ${assignment.assignedTo.length - 1}명`
                          : assignment.assignedTo[0]}
                      </span>
                    </div>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  </div>
                </motion.div>
              ))}

              {completedAssignments.length === 0 && (
                <div className="flex flex-col items-center justify-center h-20 border border-dashed rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">완료된 숙제가 없습니다</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 숙제 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>새 숙제 추가</DialogTitle>
            <DialogDescription>새로운 숙제를 생성하고 학생들에게 할당합니다.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="숙제 제목"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="숙제에 대한 자세한 설명"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">마감일</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newAssignment.dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAssignment.dueDate ? (
                      format(new Date(newAssignment.dueDate), "yyyy년 MM월 dd일", { locale: ko })
                    ) : (
                      <span>날짜 선택</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={new Date(newAssignment.dueDate)}
                    onSelect={(date) =>
                      date &&
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: date.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">우선순위</Label>
              <Select
                value={newAssignment.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setNewAssignment({ ...newAssignment, priority: value })
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="medium">중간</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>학생 선택</Label>
              <Select value={selectedGroup} onValueChange={handleGroupChange}>
                <SelectTrigger>
                  <SelectValue placeholder="학생 그룹 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 학생</SelectItem>
                  <SelectItem value="none">개별 선택</SelectItem>
                  {classes.map((classGroup) => (
                    <SelectItem key={classGroup.id} value={classGroup.name}>
                      {classGroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedGroup === "none" && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {studentGroups
                    .flatMap((group) => group.students)
                    .map((student) => (
                      <div key={student} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student}`}
                          checked={selectedStudents.includes(student)}
                          onCheckedChange={() => toggleStudent(student)}
                        />
                        <Label htmlFor={`student-${student}`}>{student}</Label>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              취소
            </Button>
            <Button
              onClick={addAssignment}
              disabled={newAssignment.title.trim() === "" || selectedStudents.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              숙제 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 숙제 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>숙제 수정</DialogTitle>
            <DialogDescription>숙제 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingAssignment && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">제목</Label>
                <Input
                  id="edit-title"
                  placeholder="숙제 제목"
                  value={editingAssignment.title}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">설명</Label>
                <Textarea
                  id="edit-description"
                  placeholder="숙제에 대한 자세한 설명"
                  value={editingAssignment.description}
                  onChange={(e) =>
                    setEditingAssignment({
                      ...editingAssignment,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-dueDate">마감일</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(editingAssignment.dueDate), "yyyy년 MM월 dd일", { locale: ko })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(editingAssignment.dueDate)}
                      onSelect={(date) =>
                        date &&
                        setEditingAssignment({
                          ...editingAssignment,
                          dueDate: date.toISOString(),
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-priority">우선순위</Label>
                <Select
                  value={editingAssignment.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setEditingAssignment({ ...editingAssignment, priority: value })
                  }
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue placeholder="우선순위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">높음</SelectItem>
                    <SelectItem value="medium">중간</SelectItem>
                    <SelectItem value="low">낮음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-status">상태</Label>
                <Select
                  value={editingAssignment.status}
                  onValueChange={(value: "todo" | "in-progress" | "completed") =>
                    setEditingAssignment({ ...editingAssignment, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">할 일</SelectItem>
                    <SelectItem value="in-progress">진행 중</SelectItem>
                    <SelectItem value="completed">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>할당된 학생</Label>
                <div className="flex flex-wrap gap-1 p-2 border rounded-md">
                  {editingAssignment.assignedTo.map((student, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {student}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => {
                          setEditingAssignment({
                            ...editingAssignment,
                            assignedTo: editingAssignment.assignedTo.filter((_, i) => i !== index),
                          })
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {editingAssignment.assignedTo.length === 0 && (
                    <span className="text-sm text-muted-foreground">할당된 학생이 없습니다</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={updateAssignment} disabled={!editingAssignment || editingAssignment.title.trim() === ""}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
