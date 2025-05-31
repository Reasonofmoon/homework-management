"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, isSameDay, addMonths, subMonths, parseISO, isValid } from "date-fns"
import { ko } from "date-fns/locale"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Filter,
  CheckCircle2,
  Clock,
  Users,
  Pencil,
  Trash2,
  Plus,
  CalendarIcon,
} from "lucide-react"
import { motion } from "@/components/ui/motion"
import { cn } from "@/lib/utils"
import { CustomCalendar, type CalendarEvent } from "@/components/ui/custom-calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Locale } from "date-fns"
import { useClasses } from "@/hooks/use-classes"

// 숙제 데이터 타입 정의
interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string // ISO date string
  assignedTo: string[]
  status: "active" | "completed"
}

export default function CalendarPage() {
  const today = new Date()

  // Ensure we start with valid dates
  const [date, setDate] = useState<Date>(today)
  const [currentMonth, setCurrentMonth] = useState<Date>(today)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventDetails, setShowEventDetails] = useState(false)

  // Add this near the other useState hooks
  const { classes } = useClasses()

  // 샘플 숙제 데이터
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
      title: "어휘 시험 준비",
      description: "어휘 시험 준비 및 복습",
      dueDate: new Date(2025, 2, 29).toISOString(), // 2025년 3월 29일
      assignedTo: ["A반"],
      status: "active",
    },
    {
      id: "4",
      title: "소리 모닝 완료",
      description: "소리 모닝 학습 완료하기",
      dueDate: new Date(2025, 2, 31).toISOString(), // 2025년 3월 31일
      assignedTo: ["B반"],
      status: "active",
    },
    {
      id: "5",
      title: "어휘 501-525",
      description: "어휘 501-525 학습 및 암기",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김온유"],
      status: "active",
    },
    {
      id: "6",
      title: "어휘 751-775 스펠링",
      description: "어휘 751-775 스펠링 연습",
      dueDate: new Date(2025, 2, 24).toISOString(), // 2025년 3월 24일
      assignedTo: ["김석준"],
      status: "active",
    },
    {
      id: "7",
      title: "영어 에세이 작성",
      description: "주제: My Future Dream",
      dueDate: new Date(2025, 2, 26).toISOString(),
      assignedTo: ["A반"],
      status: "active",
    },
    {
      id: "8",
      title: "문법 연습 문제",
      description: "Unit 5-6 문법 연습 문제 풀기",
      dueDate: new Date(2025, 2, 25).toISOString(),
      assignedTo: ["B반"],
      status: "active",
    },
    {
      id: "9",
      title: "발표 준비",
      description: "좋아하는 책에 대한 발표 준비",
      dueDate: new Date(2025, 2, 28).toISOString(),
      assignedTo: ["김온유", "김석준"],
      status: "active",
    },
  ]

  const [assignments, setAssignments] = useLocalStorage<Assignment[]>("assignments", initialAssignments)
  const [students, setStudents] = useLocalStorage<any[]>("students", [])

  // 필터링된 숙제 목록
  const filteredAssignments = assignments.filter((assignment) => {
    // 상태 필터링
    if (filterStatus !== "all" && assignment.status !== filterStatus) {
      return false
    }

    // 할당자 필터링
    if (filterAssignee !== "all") {
      if (filterAssignee === "전체 학생") {
        return assignment.assignedTo.includes("전체 학생")
      } else {
        return assignment.assignedTo.includes(filterAssignee)
      }
    }

    return true
  })

  // 선택한 날짜의 숙제 필터링
  const selectedDateAssignments = filteredAssignments.filter((assignment) => {
    try {
      const assignmentDate = parseISO(assignment.dueDate)
      return isValid(assignmentDate) && isValid(date) && isSameDay(assignmentDate, date)
    } catch (error) {
      console.error(`Error comparing dates for assignment ${assignment.id}:`, error)
      return false
    }
  })

  // 할당 대상 목록 (필터용)
  const assigneeOptions = ["전체 학생", ...classes.map((c) => c.name)]

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => {
      try {
        if (!isValid(prevMonth)) return today
        return subMonths(prevMonth, 1)
      } catch (error) {
        console.error("Error navigating to previous month:", error)
        return today
      }
    })
  }

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => {
      try {
        if (!isValid(prevMonth)) return today
        return addMonths(prevMonth, 1)
      } catch (error) {
        console.error("Error navigating to next month:", error)
        return today
      }
    })
  }

  // 숙제 상태 변경
  const toggleAssignmentStatus = (id: string) => {
    setAssignments(
      assignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, status: assignment.status === "active" ? "completed" : "active" }
          : assignment,
      ),
    )
  }

  // 숙제를 캘린더 이벤트로 변환
  const calendarEvents: CalendarEvent[] = filteredAssignments
    .filter((assignment) => {
      try {
        // Validate the date string format first
        if (!assignment.dueDate || typeof assignment.dueDate !== "string") {
          console.error(`Invalid dueDate for assignment ${assignment.id}:`, assignment.dueDate)
          return false
        }

        const date = parseISO(assignment.dueDate)
        return isValid(date)
      } catch (error) {
        console.error(`Invalid date format for assignment ${assignment.id}:`, error)
        return false
      }
    })
    .map((assignment) => {
      try {
        // Parse the date once we know it's valid
        const parsedDate = parseISO(assignment.dueDate)

        // 상태에 따른 색상 결정
        let color = "blue"
        if (assignment.status === "completed") {
          color = "green"
        } else if (assignment.assignedTo.includes("전체 학생")) {
          color = "purple"
        } else {
          // Assign colors based on class name
          const classIndex = classes.findIndex((c) => assignment.assignedTo.includes(c.name))

          // Rotate through a set of colors based on class index
          const colorOptions = ["orange", "pink", "blue", "indigo", "violet", "teal"]
          if (classIndex >= 0) {
            color = colorOptions[classIndex % colorOptions.length]
          }
        }

        return {
          id: assignment.id,
          title: assignment.title,
          date: parsedDate,
          color,
        }
      } catch (error) {
        console.error(`Error creating calendar event for assignment ${assignment.id}:`, error)
        // Return a fallback event with today's date if there's an error
        return {
          id: assignment.id,
          title: assignment.title,
          date: today,
          color: "blue",
        }
      }
    })

  // 이벤트 클릭 핸들러
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventDetails(true)

    // 해당 날짜 선택 (ensure it's a valid Date object)
    if (event.date instanceof Date && isValid(event.date)) {
      setDate(event.date)
    } else if (typeof event.date === "string") {
      try {
        const parsedDate = parseISO(event.date)
        if (isValid(parsedDate)) {
          setDate(parsedDate)
        }
      } catch (error) {
        console.error("Error parsing event date:", error)
      }
    }
  }

  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    if (isValid(date)) {
      setDate(date)
    } else {
      console.error("Invalid date clicked:", date)
    }
  }

  // 선택된 이벤트에 해당하는 숙제 찾기
  const selectedAssignment = selectedEvent ? assignments.find((a) => a.id === selectedEvent.id) : null

  // Format date safely
  const formatDateSafe = (date: Date, formatString: string, options?: { locale?: Locale }) => {
    try {
      if (!isValid(date)) return "Invalid date"
      return format(date, formatString, options)
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-3xl font-bold tracking-tight">숙제 캘린더</h2>
          <Badge variant="outline" className="ml-2">
            {filteredAssignments.length}개 항목
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "month" | "week" | "day")}
            className="mr-2"
          >
            <TabsList className="h-9">
              <TabsTrigger value="month" className="px-3">
                월
              </TabsTrigger>
              <TabsTrigger value="week" className="px-3">
                주
              </TabsTrigger>
              <TabsTrigger value="day" className="px-3">
                일
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              setCurrentMonth(today)
              setDate(today)
            }}
          >
            오늘
          </Button>

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

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground pt-2">상태</DropdownMenuLabel>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterStatus === "all" && "bg-primary/10 font-medium")}
                onClick={() => setFilterStatus("all")}
              >
                <span className={cn("h-2 w-2 rounded-full", filterStatus === "all" ? "bg-primary" : "bg-muted")} />
                모든 숙제
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterStatus === "active" && "bg-primary/10 font-medium")}
                onClick={() => setFilterStatus("active")}
              >
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                활성 숙제
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn("gap-2 cursor-pointer", filterStatus === "completed" && "bg-primary/10 font-medium")}
                onClick={() => setFilterStatus("completed")}
              >
                <span className="h-2 w-2 rounded-full bg-green-500" />
                완료된 숙제
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

          <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            숙제 추가
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card className="col-span-1 shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 p-0 rounded-full">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">이전 달</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 p-0 rounded-full">
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">다음 달</span>
                </Button>
              </div>

              <h3 className="text-xl font-semibold">{formatDateSafe(currentMonth, "yyyy년 MMMM", { locale: ko })}</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span>전체 학생</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>A반</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span>B반</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>완료됨</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div>
              <CustomCalendar
                mode="default"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="w-full"
                locale={ko}
                events={calendarEvents}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                weekStartsOn={0}
                fixedWeeks
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 선택한 날짜의 숙제 목록 */}
      <Card className="shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div>
            <CardTitle className="text-lg">{formatDateSafe(date, "yyyy년 MM월 dd일 (eee)", { locale: ko })}</CardTitle>
            <CardDescription>선택한 날짜의 숙제 목록입니다.</CardDescription>
          </div>
          <Badge variant="outline" className="font-normal">
            {selectedDateAssignments.length}개 항목
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          <ScrollArea className="h-[300px] pr-4">
            {selectedDateAssignments.length > 0 ? (
              <div className="space-y-3">
                {selectedDateAssignments.map((assignment) => (
                  <motion.div
                    key={assignment.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge
                          variant={assignment.status === "active" ? "default" : "secondary"}
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => toggleAssignmentStatus(assignment.id)}
                        >
                          {assignment.status === "active" ? "활성" : "완료"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{assignment.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {assignment.assignedTo.map((student, index) => (
                          <Badge key={index} variant="outline">
                            {student}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 flex justify-between items-center">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateSafe(parseISO(assignment.dueDate), "yyyy년 MM월 dd일", { locale: ko })}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">메뉴 열기</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="cursor-pointer">
                            <Pencil className="mr-2 h-4 w-4" />
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {assignment.status === "active" ? "완료로 표시" : "활성으로 표시"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                선택한 날짜에 등록된 숙제가 없습니다.
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 이벤트 상세 정보 다이얼로그 */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>숙제 상세 정보</DialogTitle>
            <DialogDescription>
              {selectedAssignment &&
                isValid(parseISO(selectedAssignment.dueDate)) &&
                formatDateSafe(parseISO(selectedAssignment.dueDate), "yyyy년 MM월 dd일 (eee)", { locale: ko })}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">{selectedAssignment.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedAssignment.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatDateSafe(parseISO(selectedAssignment.dueDate), "yyyy년 MM월 dd일", { locale: ko })}
                  </span>
                </div>
                <Badge variant={selectedAssignment.status === "active" ? "default" : "secondary"}>
                  {selectedAssignment.status === "active" ? "활성" : "완료"}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">할당된 학생</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedAssignment.assignedTo.map((student, index) => (
                    <Badge key={index} variant="outline">
                      {student}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setShowEventDetails(false)}>
              닫기
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1">
                <Pencil className="h-4 w-4" />
                수정
              </Button>
              <Button
                variant={selectedAssignment?.status === "active" ? "default" : "secondary"}
                className="gap-1"
                onClick={() => {
                  if (selectedAssignment) {
                    toggleAssignmentStatus(selectedAssignment.id)
                    setShowEventDetails(false)
                  }
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
                {selectedAssignment?.status === "active" ? "완료로 표시" : "활성으로 표시"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
