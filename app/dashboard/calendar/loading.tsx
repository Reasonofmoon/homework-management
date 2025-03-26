import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[180px]" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-[120px]" />
          <Skeleton className="h-9 w-[80px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-6 w-[150px]" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 gap-px">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-10 w-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={`cell-${i}`} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-6 w-[60px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`event-${i}`} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

