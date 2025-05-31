import { Progress } from "@/components/ui/progress"

export function StudentProgress() {
  const students = [
    { id: 1, name: "김온유", progress: 75 },
    { id: 2, name: "김석준", progress: 60 },
    { id: 3, name: "김승준", progress: 85 },
    { id: 4, name: "오예원", progress: 90 },
    { id: 5, name: "신아민", progress: 70 },
    { id: 6, name: "홍주연", progress: 80 },
  ]

  return (
    <div className="space-y-4">
      {students.map((student) => (
        <div key={student.id} className="grid gap-2">
          <div className="flex items-center justify-between">
            <div className="font-medium">{student.name}</div>
            <div className="text-sm text-muted-foreground">{student.progress}%</div>
          </div>
          <Progress value={student.progress} className="h-2" />
        </div>
      ))}
    </div>
  )
}
