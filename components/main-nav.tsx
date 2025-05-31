"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Settings, LayoutDashboard, Users, BookOpen, Calendar, FileCode, Bot } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function MainNav() {
  const pathname = usePathname()
  const isMobile = useMobile()

  const menuItems = [
    {
      href: "/dashboard",
      label: "대시보드",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/students",
      label: "학생 관리",
      icon: <Users className="h-4 w-4" />,
      active: pathname?.startsWith("/dashboard/students"),
    },
    {
      href: "/dashboard/assignments",
      label: "숙제 관리",
      icon: <BookOpen className="h-4 w-4" />,
      active: pathname?.startsWith("/dashboard/assignments"),
    },
    {
      href: "/dashboard/calendar",
      label: "캘린더",
      icon: <Calendar className="h-4 w-4" />,
      active: pathname?.startsWith("/dashboard/calendar"),
    },
    {
      href: "/dashboard/apps-script",
      label: "Apps Script",
      icon: <FileCode className="h-4 w-4" />,
      active: pathname?.startsWith("/dashboard/apps-script"),
    },
    {
      href: "/dashboard/automations",
      label: "자동화",
      icon: <Bot className="h-4 w-4" />,
      active: pathname?.startsWith("/dashboard/automations"),
    },
    {
      href: "/settings",
      label: "설정",
      icon: <Settings className="h-4 w-4" />,
      active: pathname?.startsWith("/settings"),
    },
  ]

  return (
    <div className="mr-4 flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="font-bold text-blue-700 dark:text-blue-300">Reason of Moon</span>
      </Link>

      {isMobile ? (
        // 모바일 메뉴 (아이콘만 표시)
        <nav className="flex items-center space-x-2 text-sm font-medium">
          {menuItems.map((item) => (
            <DropdownMenu key={item.href}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    item.active
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  <span className="sr-only">{item.label}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={item.href}>{item.label}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      ) : (
        // 데스크톱 메뉴 (기존 메뉴)
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-blue-700 dark:hover:text-blue-300",
                item.active ? "text-blue-700 dark:text-blue-300" : "text-muted-foreground",
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
