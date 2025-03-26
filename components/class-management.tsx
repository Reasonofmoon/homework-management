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
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useClasses, type ClassGroup } from "@/hooks/use-classes"
import { useToast } from "@/hooks/use-toast"

export function ClassManagement() {
  const { classes, addClass, editClass, deleteClass } = useClasses()
  const { toast } = useToast()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [newClassName, setNewClassName] = useState("")
  const [editingClass, setEditingClass] = useState<ClassGroup | null>(null)

  // Handle adding a new class
  const handleAddClass = () => {
    if (newClassName.trim() === "") return

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
    if (!editingClass || editingClass.name.trim() === "") return

    const success = editClass(editingClass.id, editingClass.name.trim())
    if (success) {
      toast({
        title: "반 수정 완료",
        description: `반 이름이 수정되었습니다.`,
      })
      setShowEditDialog(false)
    } else {
      toast({
        title: "반 수정 실패",
        description: "같은 이름의 반이 이미 존재합니다.",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a class
  const handleDeleteClass = (id: string, name: string) => {
    if (confirm(`정말로 "${name}" 반을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      deleteClass(id)
      toast({
        title: "반 삭제 완료",
        description: `${name} 반이 삭제되었습니다.`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">반 관리</h3>
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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>반 이름</TableHead>
              <TableHead className="w-[100px] text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classGroup) => (
              <TableRow key={classGroup.id}>
                <TableCell className="font-medium">{classGroup.name}</TableCell>
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
            ))}
            {classes.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                  등록된 반이 없습니다. 반을 추가해주세요.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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

