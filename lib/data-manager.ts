import type { Student, Assignment, ApiResponse, AssignmentFilters, StudentFilters } from "@/lib/types"

// Enhanced data manager with better error handling and performance
export class DataManager {
  private static instance: DataManager
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager()
    }
    return DataManager.instance
  }

  // Cache management
  private setCacheItem<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private getCacheItem<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  private clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Enhanced local storage operations with error handling
  private async safeLocalStorageOperation<T>(operation: () => T, fallback: T, errorMessage: string): Promise<T> {
    try {
      return operation()
    } catch (error) {
      console.error(`${errorMessage}:`, error)
      return fallback
    }
  }

  // Student management
  async getStudents(filters?: StudentFilters): Promise<ApiResponse<Student[]>> {
    const cacheKey = `students_${JSON.stringify(filters || {})}`
    const cached = this.getCacheItem<Student[]>(cacheKey)

    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      }
    }

    try {
      const students = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("students")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load students from localStorage",
      )

      let filteredStudents = students

      if (filters) {
        filteredStudents = this.applyStudentFilters(students, filters)
      }

      this.setCacheItem(cacheKey, filteredStudents)

      return {
        success: true,
        data: filteredStudents,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async saveStudent(student: Student): Promise<ApiResponse<Student>> {
    try {
      const students = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("students")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load students for saving",
      )

      const existingIndex = students.findIndex((s: Student) => s.id === student.id)

      if (existingIndex >= 0) {
        students[existingIndex] = { ...student, updatedAt: new Date().toISOString() }
      } else {
        students.push({ ...student, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      }

      await this.safeLocalStorageOperation(
        () => localStorage.setItem("students", JSON.stringify(students)),
        undefined,
        "Failed to save students to localStorage",
      )

      this.clearCache("students")

      return {
        success: true,
        data: student,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save student",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<boolean>> {
    try {
      const students = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("students")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load students for deletion",
      )

      const filteredStudents = students.filter((s: Student) => s.id !== studentId)

      await this.safeLocalStorageOperation(
        () => localStorage.setItem("students", JSON.stringify(filteredStudents)),
        undefined,
        "Failed to save students after deletion",
      )

      this.clearCache("students")

      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete student",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Assignment management
  async getAssignments(filters?: AssignmentFilters): Promise<ApiResponse<Assignment[]>> {
    const cacheKey = `assignments_${JSON.stringify(filters || {})}`
    const cached = this.getCacheItem<Assignment[]>(cacheKey)

    if (cached) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      }
    }

    try {
      const assignments = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("assignments")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load assignments from localStorage",
      )

      let filteredAssignments = assignments

      if (filters) {
        filteredAssignments = this.applyAssignmentFilters(assignments, filters)
      }

      this.setCacheItem(cacheKey, filteredAssignments)

      return {
        success: true,
        data: filteredAssignments,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async saveAssignment(assignment: Assignment): Promise<ApiResponse<Assignment>> {
    try {
      const assignments = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("assignments")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load assignments for saving",
      )

      const existingIndex = assignments.findIndex((a: Assignment) => a.id === assignment.id)

      if (existingIndex >= 0) {
        assignments[existingIndex] = { ...assignment, updatedAt: new Date().toISOString() }
      } else {
        assignments.push({ ...assignment, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      }

      await this.safeLocalStorageOperation(
        () => localStorage.setItem("assignments", JSON.stringify(assignments)),
        undefined,
        "Failed to save assignments to localStorage",
      )

      this.clearCache("assignments")

      return {
        success: true,
        data: assignment,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save assignment",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Filter implementations
  private applyStudentFilters(students: Student[], filters: StudentFilters): Student[] {
    return students.filter((student) => {
      if (filters.status && !filters.status.includes(student.status)) {
        return false
      }

      if (filters.groups && !filters.groups.includes(student.group)) {
        return false
      }

      if (filters.completionRateRange) {
        const { min, max } = filters.completionRateRange
        if (student.completionRate < min || student.completionRate > max) {
          return false
        }
      }

      return true
    })
  }

  private applyAssignmentFilters(assignments: Assignment[], filters: AssignmentFilters): Assignment[] {
    return assignments.filter((assignment) => {
      if (filters.status && !filters.status.includes(assignment.status)) {
        return false
      }

      if (filters.priority && !filters.priority.includes(assignment.priority)) {
        return false
      }

      if (filters.type && assignment.type && !filters.type.includes(assignment.type)) {
        return false
      }

      if (filters.assignedTo && !filters.assignedTo.some((assignee) => assignment.assignedTo.includes(assignee))) {
        return false
      }

      if (filters.dateRange) {
        const dueDate = new Date(assignment.dueDate)
        const startDate = new Date(filters.dateRange.start)
        const endDate = new Date(filters.dateRange.end)

        if (dueDate < startDate || dueDate > endDate) {
          return false
        }
      }

      if (filters.tags && assignment.tags) {
        const hasMatchingTag = filters.tags.some((tag) => assignment.tags?.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      return true
    })
  }

  // Bulk operations
  async bulkUpdateAssignments(
    assignmentIds: string[],
    updates: Partial<Assignment>,
  ): Promise<ApiResponse<Assignment[]>> {
    try {
      const assignments = await this.safeLocalStorageOperation(
        () => {
          const data = localStorage.getItem("assignments")
          return data ? JSON.parse(data) : []
        },
        [],
        "Failed to load assignments for bulk update",
      )

      const updatedAssignments = assignments.map((assignment: Assignment) => {
        if (assignmentIds.includes(assignment.id)) {
          return { ...assignment, ...updates, updatedAt: new Date().toISOString() }
        }
        return assignment
      })

      await this.safeLocalStorageOperation(
        () => localStorage.setItem("assignments", JSON.stringify(updatedAssignments)),
        undefined,
        "Failed to save assignments after bulk update",
      )

      this.clearCache("assignments")

      const updated = updatedAssignments.filter((a: Assignment) => assignmentIds.includes(a.id))

      return {
        success: true,
        data: updated,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to bulk update assignments",
        timestamp: new Date().toISOString(),
      }
    }
  }

  // Search functionality
  async searchStudents(query: string): Promise<ApiResponse<Student[]>> {
    try {
      const response = await this.getStudents()
      if (!response.success || !response.data) {
        return response
      }

      const searchTerm = query.toLowerCase().trim()
      const filteredStudents = response.data.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm) ||
          student.group.toLowerCase().includes(searchTerm) ||
          student.email?.toLowerCase().includes(searchTerm) ||
          student.notes?.toLowerCase().includes(searchTerm),
      )

      return {
        success: true,
        data: filteredStudents,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
        timestamp: new Date().toISOString(),
      }
    }
  }

  async searchAssignments(query: string): Promise<ApiResponse<Assignment[]>> {
    try {
      const response = await this.getAssignments()
      if (!response.success || !response.data) {
        return response
      }

      const searchTerm = query.toLowerCase().trim()
      const filteredAssignments = response.data.filter(
        (assignment) =>
          assignment.title.toLowerCase().includes(searchTerm) ||
          assignment.description.toLowerCase().includes(searchTerm) ||
          assignment.assignedTo.some((assignee) => assignee.toLowerCase().includes(searchTerm)) ||
          assignment.tags?.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )

      return {
        success: true,
        data: filteredAssignments,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Search failed",
        timestamp: new Date().toISOString(),
      }
    }
  }
}

// Export singleton instance
export const dataManager = DataManager.getInstance()
