"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"
import { useState } from "react"
// Update the import to use default export if needed
import TutorialContent from "@/components/tutorial-content"
import { ScrollArea } from "@/components/ui/scroll-area"

export function HelpButton() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* 버튼 크기 조정 */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-950 dark:hover:text-blue-300"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">도움말</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-blue-700 dark:text-blue-300">학생 숙제 관리 시스템 사용 가이드</DialogTitle>
          <DialogDescription>시스템 사용 방법에 대한 상세한 안내입니다.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <TutorialContent />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
