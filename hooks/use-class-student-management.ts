"use client"

import { useEffect, useCallback } from "react"
import { useClasses } from "./use-classes"
import { useLocalStorage } from "./use-local-storage"

interface Student {
  id: string
  name: string
  group: string
  status: "active" | "inactive"
  completionRate: number
}

interface ClassStudentStats {
  className: string
  totalStudents: number
  activeStudents: number
  averageCompletion: number
}

export function useClassStudentManagement() {
  const { classes, addClass, editClass, deleteClass } = useClasses()
  const [students, setStudents] = useLocalStorage<Student[]>("students", [])

  // Get students by class
  const getStudentsByClass = useCallback(
    (className: string) => {
      return students.filter((student) => student.group === className)
    },
    [students],
  )

  // Get class statistics
  const getClassStats = useCallback((): ClassStudentStats[] => {
    return classes.map((classGroup) => {
      const classStudents = getStudentsByClass(classGroup.name)
      const activeStudents = classStudents.filter((s) => s.status === "active")
      const averageCompletion =
        classStudents.length > 0
          ? Math.round(classStudents.reduce((sum, s) => sum + s.completionRate, 0) / classStudents.length)
          : 0

      return {
        className: classGroup.name,
        totalStudents: classStudents.length,
        activeStudents: activeStudents.length,
        averageCompletion,
      }
    })
  }, [classes, getStudentsByClass])

  // Validate student class assignment
  const validateStudentClass = useCallback(
    (className: string): boolean => {
      return classes.some((c) => c.name === className)
    },
    [classes],
  )

  // Clean up students when classes are deleted
  const cleanupOrphanedStudents = useCallback(() => {
    const validClassNames = classes.map((c) => c.name)
    const defaultClass = validClassNames.length > 0 ? validClassNames[0] : "A반"

    const updatedStudents = students.map((student) => {
      if (!validClassNames.includes(student.group)) {
        console.warn(
          `Student ${student.name} was assigned to deleted class ${student.group}, moving to ${defaultClass}`,
        )
        return { ...student, group: defaultClass }
      }
      return student
    })

    const hasChanges = updatedStudents.some((student, index) => student.group !== students[index]?.group)

    if (hasChanges) {
      setStudents(updatedStudents)
      return updatedStudents.length - students.filter((s) => validClassNames.includes(s.group)).length
    }
    return 0
  }, [classes, students, setStudents])

  // Enhanced class deletion with student handling
  const deleteClassWithStudentHandling = useCallback(
    (classId: string, className: string) => {
      const studentsInClass = getStudentsByClass(className)

      if (studentsInClass.length > 0) {
        const confirmMessage = `"${className}" 반에 ${studentsInClass.length}명의 학생이 있습니다. 반을 삭제하면 이 학생들은 다른 반으로 이동됩니다. 계속하시겠습니까?`
        if (!confirm(confirmMessage)) {
          return false
        }
      }

      const success = deleteClass(classId)
      if (success) {
        // Clean up will happen automatically via useEffect
        return true
      }
      return false
    },
    [getStudentsByClass, deleteClass],
  )

  // Move students between classes
  const moveStudentsToClass = useCallback(
    (studentIds: string[], targetClassName: string) => {
      if (!validateStudentClass(targetClassName)) {
        throw new Error(`Target class "${targetClassName}" does not exist`)
      }

      const updatedStudents = students.map((student) => {
        if (studentIds.includes(student.id)) {
          return { ...student, group: targetClassName }
        }
        return student
      })

      setStudents(updatedStudents)
      return updatedStudents.filter((s) => studentIds.includes(s.id))
    },
    [students, setStudents, validateStudentClass],
  )

  // Auto-cleanup effect
  useEffect(() => {
    cleanupOrphanedStudents()
  }, [classes]) // Only depend on classes to avoid infinite loops

  return {
    classes,
    students,
    addClass,
    editClass,
    deleteClass: deleteClassWithStudentHandling,
    getStudentsByClass,
    getClassStats,
    validateStudentClass,
    cleanupOrphanedStudents,
    moveStudentsToClass,
    setStudents,
  }
}
