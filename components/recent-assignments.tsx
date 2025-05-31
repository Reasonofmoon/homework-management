import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function RecentAssignments() {
  const assignments = [
    {
      id: 1,
      title: "Dragon Masters 5권 챕터 1-5 읽기",
      date: "2025년 3월 24일",
      assignedTo: "전체 학생",
      status: "active",
    },
    {
      id: 2,
      title: "퀴즐릿 연습",
      date: "2025년 3월 24일",
      assignedTo: "전체 학생",
      status: "active",
    },
    {
      id: 3,
      title: "어휘 501-525",
      date: "2025년 3월 24일",
      assignedTo: "김온유",
      status: "active",
    },
    {
      id: 4,
      title: "어휘 751-775 스펠링",
      date: "2025년 3월 24일",
      assignedTo: "김석준",
      status: "active",
    },
    {
      id: 5,
      title: "소리 모닝 91-100",
      date: "2025년 3월 24일",
      assignedTo: "김온유",
      status: "active",
    },
  ]

  return (
    <div className="space-y-8">
      {assignments.map((assignment) => (
        <div key={assignment.id} className="flex items-center">
          <Avatar className="h-9 w-9 mr-4">
            <AvatarImage src="/placeholder.svg" alt="Assignment" />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium leading-none">{assignment.title}</p>
            <div className="flex items-center pt-2">
              <p className="text-xs text-muted-foreground">{assignment.date}</p>
              <span className="px-2 text-muted-foreground">•</span>
              <p className="text-xs text-muted-foreground">{assignment.assignedTo}</p>
            </div>
          </div>
          <Badge variant={assignment.status === "active" ? "default" : "secondary"}>
            {assignment.status === "active" ? "활성" : "완료"}
          </Badge>
        </div>
      ))}
    </div>
  )
}
