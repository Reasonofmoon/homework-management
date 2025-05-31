"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function LocalModeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLocalMode, setIsLocalMode] = useState(false)

  useEffect(() => {
    // Check if running in local mode (file:// protocol)
    const isLocal = window.location.protocol === "file:"
    setIsLocalMode(isLocal)
    setIsVisible(isLocal)

    // Check if the user has dismissed the banner before
    const dismissed = localStorage.getItem("local_banner_dismissed")
    if (dismissed === "true") {
      setIsVisible(false)
    }
  }, [])

  const dismissBanner = () => {
    setIsVisible(false)
    localStorage.setItem("local_banner_dismissed", "true")
  }

  if (!isVisible || !isLocalMode) return null

  return (
    <Alert className="relative mb-4 border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>로컬 모드에서 실행 중</AlertTitle>
      <AlertDescription>
        이 애플리케이션은 현재 로컬 모드에서 실행 중입니다. 모든 데이터는 이 브라우저의 로컬 스토리지에 저장됩니다. 구글
        시트 연동을 위해서는 인터넷 연결이 필요합니다.
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 rounded-full p-0"
        onClick={dismissBanner}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">닫기</span>
      </Button>
    </Alert>
  )
}
