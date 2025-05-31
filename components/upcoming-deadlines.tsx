import { Badge } from "@/components/ui/badge"

export function UpcomingDeadlines() {
  const deadlines = [
    {
      id: 1,
      title: "Dragon Masters 5권 챕터 1-5 읽기",
      dueDate: "2025년 3월 27일",
      daysLeft: 3,
    },
    {
      id: 2,
      title: "퀴즐릿 연습",
      dueDate: "2025년 3월 27일",
      daysLeft: 3,
    },
    {
      id: 3,
      title: "어휘 시험 준비",
      dueDate: "2025년 3월 29일",
      daysLeft: 5,
    },
    {
      id: 4,
      title: "소리 모닝 완료",
      dueDate: "2025년 3월 31일",
      daysLeft: 7,
    },
  ]

  return (
    <div className="space-y-4">
      {deadlines.map((deadline) => (
        <div key={deadline.id} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{deadline.title}</p>
            <p className="text-xs text-muted-foreground">{deadline.dueDate}</p>
          </div>
          <Badge variant={deadline.daysLeft <= 3 ? "destructive" : "outline"}>{deadline.daysLeft}일 남음</Badge>
        </div>
      ))}
    </div>
  )
}
