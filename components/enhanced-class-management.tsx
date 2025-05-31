"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Pencil, Trash2, Users, TrendingUp, AlertTriangle } from "lucide-react"
import { useClassStudentManagement } from "@/hooks/use-class-student-management"
import { useToast } from "@/hooks/use-toast"

export function EnhancedClassManagement() {
  const { classes, addClass, editClass, deleteClass, getClassStats, cleanupOrphanedStudents } =
    useClassStudentManagement()
  const { toast } = useToast()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [editingClass, setEditingClass] = useState<{ id: string; name: string } | null>(null)

  const classStats = getClassStats()

  // Handle adding a new class
  const handleAddClass = () => {
    if (newClassName.trim() === "") {
      toast({
        title: "입력 오류",
        description: "반 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const success = addClass(newClassName.trim())
    if (success) {
      toast({
        title: "반 추가 완료",
        description: `${newClassName} 반이 추가되었습니다.`,
      })
      setNewClassName("")
      setShowAddDialog(false)
    } else {
      toast({
        title: "반 추가 실패",
        description: "같은 이름의 반이 이미 존재합니다.",
        variant: "destructive",
      })
    }
  }

  // Handle editing a class
  const handleEditClass = () => {
    if (!editingClass || editingClass.name.trim() === "") {
      toast({
        title: "입력 오류",
        description: "반 이름을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const success = editClass(editingClass.id, editingClass.name.trim())
    if (success) {
      toast({
        title: "반 수정 완료",
        description: `반 이름이 "${editingClass.name}"(으)로 수정되었습니다.`,
      })
      setShowEditDialog(false)
      setEditingClass(null)
    } else {
      toast({
        title: "반 수정 실패",
        description: "같은 이름의 반이 이미 존재합니다.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a class
  const handleDeleteClass = async (id: string, name: string) => {
    const success = deleteClass(id, name)
    if (success) {
      toast({
        title: "반 삭제 완료",
        description: `${name} 반이 삭제되었습니다.`,
      })
    }
  }

  // Handle cleanup of orphaned students
  const handleCleanup = () => {
    const movedCount = cleanupOrphanedStudents()
    if (movedCount > 0) {
      toast({
        title: "데이터 정리 완료",
        description: `${movedCount}명의 학생이 유효한 반으로 이동되었습니다.`,
      })
    } else {
      toast({
        title: "데이터 정리",
        description: "이동이 필요한 학생이 없습니다.",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Class Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 반 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classStats.reduce((sum, stat) => sum + stat.totalStudents, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 학생 수</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classStats.reduce((sum, stat) => sum + stat.activeStudents, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 완료율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {classStats.length > 0
                ? Math.round(classStats.reduce((sum, stat) => sum + stat.averageCompletion, 0) / classStats.length)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Management */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>반 관리</CardTitle>
              <CardDescription>학생들을 그룹화하기 위한 반을 관리합니다.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCleanup}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                데이터 정리
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />반 추가
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 반 추가</DialogTitle>
                    <DialogDescription>새로운 반을 추가합니다.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Input
                        placeholder="반 이름 (예: D반, 고급반, 초급반 등)"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddClass()}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      취소
                    </Button>
                    <Button onClick={handleAddClass}>추가</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>반 이름</TableHead>
                  <TableHead>총 학생 수</TableHead>
                  <TableHead>활성 학생 수</TableHead>
                  <TableHead>평균 완료율</TableHead>
                  <TableHead className="w-[100px] text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.map((stat) => {
                  const classGroup = classes.find((c) => c.name === stat.className)
                  if (!classGroup) return null

                  return (
                    <TableRow key={classGroup.id}>
                      <TableCell className="font-medium">{stat.className}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{stat.totalStudents}명</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stat.activeStudents === stat.totalStudents ? "default" : "outline"}>
                          {stat.activeStudents}명
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            stat.averageCompletion >= 80
                              ? "default"
                              : stat.averageCompletion >= 60
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {stat.averageCompletion}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">메뉴 열기</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingClass(classGroup)
                                setShowEditDialog(true)
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClass(classGroup.id, classGroup.name)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      등록된 반이 없습니다. 반을 추가해주세요.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Class Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>반 수정</DialogTitle>
            <DialogDescription>반 이름을 수정합니다.</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  placeholder="반 이름"
                  value={editingClass.name}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleEditClass()}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button onClick={handleEditClass}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
