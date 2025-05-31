"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ApiResponse } from "@/lib/types"

interface UseEnhancedLocalStorageOptions<T> {
  serializer?: {
    parse: (value: string) => T
    stringify: (value: T) => string
  }
  validator?: (value: any) => value is T
  onError?: (error: Error) => void
  syncAcrossTabs?: boolean
  debounceMs?: number
}

interface UseEnhancedLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => Promise<ApiResponse<T>>
  loading: boolean
  error: string | null
  clearError: () => void
  refresh: () => Promise<void>
  remove: () => Promise<ApiResponse<boolean>>
}

export function useEnhancedLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseEnhancedLocalStorageOptions<T> = {},
): UseEnhancedLocalStorageReturn<T> {
  const {
    serializer = {
      parse: JSON.parse,
      stringify: JSON.stringify,
    },
    validator,
    onError,
    syncAcrossTabs = true,
    debounceMs = 300,
  } = options

  const [value, setValue] = useState<T>(initialValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const isInitializedRef = useRef(false)

  // Read value from localStorage
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item === null) {
        return initialValue
      }

      const parsed = serializer.parse(item)

      if (validator && !validator(parsed)) {
        console.warn(`Invalid data format for key "${key}", using initial value`)
        return initialValue
      }

      return parsed
    } catch (error) {
      const errorMessage = `Error reading localStorage key "${key}": ${error instanceof Error ? error.message : "Unknown error"}`
      console.error(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
      setError(errorMessage)
      return initialValue
    }
  }, [key, initialValue, serializer, validator, onError])

  // Write value to localStorage with debouncing
  const writeValue = useCallback(
    async (newValue: T): Promise<ApiResponse<T>> => {
      if (typeof window === "undefined") {
        return {
          success: false,
          error: "localStorage is not available",
          timestamp: new Date().toISOString(),
        }
      }

      return new Promise((resolve) => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
          try {
            const serializedValue = serializer.stringify(newValue)
            window.localStorage.setItem(key, serializedValue)
            setError(null)

            resolve({
              success: true,
              data: newValue,
              timestamp: new Date().toISOString(),
            })
          } catch (error) {
            const errorMessage = `Error writing to localStorage key "${key}": ${error instanceof Error ? error.message : "Unknown error"}`
            console.error(errorMessage)
            onError?.(error instanceof Error ? error : new Error(errorMessage))
            setError(errorMessage)

            resolve({
              success: false,
              error: errorMessage,
              timestamp: new Date().toISOString(),
            })
          }
        }, debounceMs)
      })
    },
    [key, serializer, onError, debounceMs],
  )

  // Initialize value from localStorage
  useEffect(() => {
    if (isInitializedRef.current) return

    setLoading(true)
    try {
      const storedValue = readValue()
      setValue(storedValue)
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to initialize from localStorage"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setLoading(false)
      isInitializedRef.current = true
    }
  }, [readValue, onError])

  // Listen for storage changes across tabs
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = serializer.parse(e.newValue)
          if (!validator || validator(newValue)) {
            setValue(newValue)
            setError(null)
          }
        } catch (error) {
          const errorMessage = `Error parsing storage change for key "${key}"`
          console.error(errorMessage, error)
          setError(errorMessage)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [key, serializer, validator, syncAcrossTabs])

  // Enhanced setValue function
  const enhancedSetValue = useCallback(
    async (newValue: T | ((prev: T) => T)): Promise<ApiResponse<T>> => {
      try {
        const valueToStore = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue

        setValue(valueToStore)
        return await writeValue(valueToStore)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to set value"
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }
      }
    },
    [value, writeValue],
  )

  // Clear error function
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Refresh function to re-read from localStorage
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const refreshedValue = readValue()
      setValue(refreshedValue)
      setError(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to refresh from localStorage"
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setLoading(false)
    }
  }, [readValue, onError])

  // Remove function
  const remove = useCallback(async (): Promise<ApiResponse<boolean>> => {
    if (typeof window === "undefined") {
      return {
        success: false,
        error: "localStorage is not available",
        timestamp: new Date().toISOString(),
      }
    }

    try {
      window.localStorage.removeItem(key)
      setValue(initialValue)
      setError(null)

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      const errorMessage = `Error removing localStorage key "${key}": ${error instanceof Error ? error.message : "Unknown error"}`
      setError(errorMessage)
      onError?.(error instanceof Error ? error : new Error(errorMessage))

      return {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }
    }
  }, [key, initialValue, onError])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    value,
    setValue: enhancedSetValue,
    loading,
    error,
    clearError,
    refresh,
    remove,
  }
}
