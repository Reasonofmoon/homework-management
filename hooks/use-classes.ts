"use client"
import { useLocalStorage } from "./use-local-storage"

export interface ClassGroup {
  id: string
  name: string
}

export function useClasses() {
  // Initialize with default classes
  const initialClasses: ClassGroup[] = [
    { id: "1", name: "A반" },
    { id: "2", name: "B반" },
    { id: "3", name: "C반" },
  ]

  const [classes, setClasses] = useLocalStorage<ClassGroup[]>("class-groups", initialClasses)

  // Add a new class
  const addClass = (name: string) => {
    // Generate a new ID (simple implementation)
    const newId = (Math.max(...classes.map((c) => Number.parseInt(c.id)), 0) + 1).toString()

    // Check if class with this name already exists
    if (classes.some((c) => c.name === name)) {
      return false
    }

    setClasses([...classes, { id: newId, name }])
    return true
  }

  // Edit a class
  const editClass = (id: string, newName: string) => {
    // Check if another class with this name already exists
    if (classes.some((c) => c.name === newName && c.id !== id)) {
      return false
    }

    setClasses(classes.map((c) => (c.id === id ? { ...c, name: newName } : c)))
    return true
  }

  // Delete a class
  const deleteClass = (id: string) => {
    setClasses(classes.filter((c) => c.id !== id))
    return true
  }

  return {
    classes,
    addClass,
    editClass,
    deleteClass,
  }
}

