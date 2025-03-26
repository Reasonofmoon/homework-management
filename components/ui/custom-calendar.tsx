"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import { format, isToday, isSameMonth, isWeekend, parseISO, isValid } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "@/components/ui/motion"

export type CalendarEvent = {
  id: string
  title: string
  date: Date | string
  color?: string
}

export type CustomCalendarProps = React.ComponentProps<typeof DayPicker> & {
  events?: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  onDateClick?: (date: Date) => void
  className?: string
}

export function CustomCalendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  onEventClick,
  onDateClick,
  ...props
}: CustomCalendarProps) {
  // Group events by date
  const eventsByDate = React.useMemo(() => {
    const grouped: Record<string, CalendarEvent[]> = {}

    events.forEach((event) => {
      try {
        // Handle both Date objects and ISO strings
        const eventDate = event.date instanceof Date ? event.date : parseISO(event.date as string)

        // Validate the date before using it
        if (!isValid(eventDate)) {
          console.warn(`Invalid date for event: ${event.id}`)
          return
        }

        const dateKey = format(eventDate, "yyyy-MM-dd")
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push({
          ...event,
          date: eventDate, // Store the parsed date
        })
      } catch (error) {
        console.error(`Error processing event date for event ${event.id}:`, error)
      }
    })

    return grouped
  }, [events])

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    try {
      if (!isValid(date)) {
        console.warn("Invalid date passed to getEventsForDate")
        return []
      }
      const dateKey = format(date, "yyyy-MM-dd")
      return eventsByDate[dateKey] || []
    } catch (error) {
      console.error("Error in getEventsForDate:", error)
      return []
    }
  }

  // Custom components for the calendar
  const components = {
    IconLeft: () => <ChevronLeft className="h-5 w-5" />,
    IconRight: () => <ChevronRight className="h-5 w-5" />,
    Dropdown: ({ value, onChange, children, ...props }: DropdownProps) => {
      return (
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="appearance-none bg-transparent border-none font-medium text-base focus:outline-none cursor-pointer px-1 rounded hover:bg-accent"
          {...props}
        >
          {children}
        </select>
      )
    },
    Caption: ({ displayMonth }) => {
      if (!displayMonth || !isValid(displayMonth)) {
        return <div className="flex justify-center items-center h-12 text-lg font-semibold">Invalid Month</div>
      }

      try {
        const month = format(displayMonth, "MMMM", { locale: ko })
        const year = format(displayMonth, "yyyy", { locale: ko })

        return (
          <div className="flex justify-center items-center h-14 text-xl font-semibold">
            <span className="mx-1">{year}년</span>
            <span className="mx-1">{month}</span>
          </div>
        )
      } catch (error) {
        console.error("Error formatting month:", error)
        return <div className="flex justify-center items-center h-12 text-lg font-semibold">Invalid Month</div>
      }
    },
    Day: ({ date, displayMonth }) => {
      // Validate dates first
      if (!date || !isValid(date) || !displayMonth || !isValid(displayMonth)) {
        return (
          <td className="p-0">
            <div className="h-full min-h-[120px] p-1 border-b border-r border-gray-100 dark:border-gray-800 bg-muted/10">
              <div className="text-center text-muted-foreground">Invalid</div>
            </div>
          </td>
        )
      }

      try {
        const isOutside = !isSameMonth(date, displayMonth)
        const isWeekendDay = isWeekend(date)
        const isCurrentDay = isToday(date)
        const dateEvents = getEventsForDate(date)

        return (
          <td className="p-0">
            <div
              className={cn(
                "h-full min-h-[120px] p-1 border-b border-r border-gray-100 dark:border-gray-800 transition-colors",
                isOutside && "opacity-40 bg-gray-50 dark:bg-gray-900",
                isWeekendDay && !isOutside && "bg-gray-50/50 dark:bg-gray-900/30",
                isCurrentDay && "bg-blue-50 dark:bg-blue-950/30",
                !isOutside && !isCurrentDay && "hover:bg-gray-50 dark:hover:bg-gray-900/20",
              )}
              onClick={() => onDateClick?.(date)}
            >
              <div className="flex justify-between items-start p-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-7 h-7 text-sm rounded-full",
                    isCurrentDay && "bg-blue-600 text-white font-medium",
                    isWeekendDay && !isCurrentDay && "text-red-500 dark:text-red-400",
                  )}
                >
                  {format(date, "d")}
                </div>
                {dateEvents.length > 3 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              <div className="mt-1 space-y-1 max-h-[calc(100%-28px)] overflow-hidden px-1">
                {dateEvents.slice(0, 3).map((event, idx) => {
                  // Map color names to Tailwind classes safely
                  let bgColorClass = "bg-blue-500"
                  const textColorClass = "text-white"
                  let hoverColorClass = "hover:bg-blue-600"

                  if (event.color === "green") {
                    bgColorClass = "bg-green-500"
                    hoverColorClass = "hover:bg-green-600"
                  } else if (event.color === "purple") {
                    bgColorClass = "bg-purple-500"
                    hoverColorClass = "hover:bg-purple-600"
                  } else if (event.color === "orange") {
                    bgColorClass = "bg-orange-500"
                    hoverColorClass = "hover:bg-orange-600"
                  } else if (event.color === "pink") {
                    bgColorClass = "bg-pink-500"
                    hoverColorClass = "hover:bg-pink-600"
                  }

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className={cn(
                        "px-2 py-1 text-xs rounded-md truncate cursor-pointer transition-colors",
                        bgColorClass,
                        textColorClass,
                        hoverColorClass,
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEventClick?.(event)
                      }}
                    >
                      {event.title}
                    </motion.div>
                  )
                })}
                {dateEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-2 mt-1">+{dateEvents.length - 3} more</div>
                )}
              </div>
            </div>
          </td>
        )
      } catch (error) {
        console.error("Error rendering day:", error)
        return (
          <td className="p-0">
            <div className="h-full min-h-[120px] p-1 border-b border-r border-gray-100 dark:border-gray-800 bg-muted/10">
              <div className="text-center text-muted-foreground">Error</div>
            </div>
          </td>
        )
      }
    },
    Row: ({ children }) => <tr className="flex w-full">{children}</tr>,
    Cell: ({ children }) => <td className="flex-1 h-full min-w-[100px]">{children}</td>,
    Head: ({ children }) => <thead className="flex border-b border-gray-200 dark:border-gray-800">{children}</thead>,
    HeadCell: ({ children }) => (
      <th className="flex-1 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 min-w-[100px]">
        {children}
      </th>
    ),
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 rounded-lg shadow-sm bg-white dark:bg-gray-950", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-0",
        caption:
          "flex justify-center relative items-center px-2 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800",
        caption_label: "text-base font-medium",
        nav: "flex items-center gap-1 absolute right-2",
        nav_button: cn(
          "h-8 w-8 bg-white dark:bg-gray-800 p-0 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-gray-100 rounded-full flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-700",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "right-2",
        table: "w-full border-collapse",
        head_row: "",
        head_cell: "",
        row: "",
        cell: "p-0 relative",
        day: "h-full w-full p-0 font-normal",
        day_range_end: "day-range-end",
        day_selected: "",
        day_today: "",
        day_outside: "",
        day_disabled: "opacity-50",
        day_range_middle: "",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        ...components,
        ...props.components,
      }}
      {...props}
    />
  )
}

