"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 로컬 스토리지에서 값을 가져오는 함수
  const readValue = (): T => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  }

  // 실제 상태 저장
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // 컴포넌트 마운트 시 로컬 스토리지에서 값 읽기
  useEffect(() => {
    setStoredValue(readValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 값을 설정하고 로컬 스토리지에 저장하는 함수
  const setValue = (value: T) => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined") {
      console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`)
    }

    try {
      // 함수로 전달된 경우 처리
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // 상태 업데이트
      setStoredValue(valueToStore)

      // 로컬 스토리지에 저장
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

