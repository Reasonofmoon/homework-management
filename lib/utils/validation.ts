import type { Student, Assignment, ValidationError, FormValidationResult } from "@/lib/types"

// Validation utility functions
export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/[\s\-$$$$]/g, ""))
  }

  static validateDate(dateString: string): boolean {
    const date = new Date(dateString)
    return !isNaN(date.getTime()) && date > new Date("1900-01-01")
  }

  static validateStudent(student: Partial<Student>): FormValidationResult {
    const errors: ValidationError[] = []

    if (!student.name?.trim()) {
      errors.push({
        field: "name",
        message: "학생 이름은 필수입니다.",
        code: "REQUIRED",
      })
    }

    if (student.name && student.name.length < 2) {
      errors.push({
        field: "name",
        message: "학생 이름은 최소 2글자 이상이어야 합니다.",
        code: "MIN_LENGTH",
      })
    }

    if (!student.group?.trim()) {
      errors.push({
        field: "group",
        message: "반 정보는 필수입니다.",
        code: "REQUIRED",
      })
    }

    if (student.email && !this.validateEmail(student.email)) {
      errors.push({
        field: "email",
        message: "올바른 이메일 형식이 아닙니다.",
        code: "INVALID_FORMAT",
      })
    }

    if (student.parentEmail && !this.validateEmail(student.parentEmail)) {
      errors.push({
        field: "parentEmail",
        message: "올바른 학부모 이메일 형식이 아닙니다.",
        code: "INVALID_FORMAT",
      })
    }

    if (student.parentPhone && !this.validatePhone(student.parentPhone)) {
      errors.push({
        field: "parentPhone",
        message: "올바른 전화번호 형식이 아닙니다.",
        code: "INVALID_FORMAT",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static validateAssignment(assignment: Partial<Assignment>): FormValidationResult {
    const errors: ValidationError[] = []

    if (!assignment.title?.trim()) {
      errors.push({
        field: "title",
        message: "과제 제목은 필수입니다.",
        code: "REQUIRED",
      })
    }

    if (assignment.title && assignment.title.length < 3) {
      errors.push({
        field: "title",
        message: "과제 제목은 최소 3글자 이상이어야 합니다.",
        code: "MIN_LENGTH",
      })
    }

    if (!assignment.description?.trim()) {
      errors.push({
        field: "description",
        message: "과제 설명은 필수입니다.",
        code: "REQUIRED",
      })
    }

    if (!assignment.dueDate) {
      errors.push({
        field: "dueDate",
        message: "마감일은 필수입니다.",
        code: "REQUIRED",
      })
    } else if (!this.validateDate(assignment.dueDate)) {
      errors.push({
        field: "dueDate",
        message: "올바른 날짜 형식이 아닙니다.",
        code: "INVALID_FORMAT",
      })
    } else if (new Date(assignment.dueDate) < new Date()) {
      errors.push({
        field: "dueDate",
        message: "마감일은 현재 시간보다 이후여야 합니다.",
        code: "INVALID_DATE",
      })
    }

    if (!assignment.assignedTo || assignment.assignedTo.length === 0) {
      errors.push({
        field: "assignedTo",
        message: "과제를 할당받을 학생을 선택해주세요.",
        code: "REQUIRED",
      })
    }

    if (assignment.points && (assignment.points < 0 || assignment.points > 1000)) {
      errors.push({
        field: "points",
        message: "점수는 0과 1000 사이의 값이어야 합니다.",
        code: "OUT_OF_RANGE",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .substring(0, 1000) // Limit length
  }

  static validateFileUpload(file: File): FormValidationResult {
    const errors: ValidationError[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (file.size > maxSize) {
      errors.push({
        field: "file",
        message: "파일 크기는 10MB를 초과할 수 없습니다.",
        code: "FILE_TOO_LARGE",
      })
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push({
        field: "file",
        message: "지원하지 않는 파일 형식입니다.",
        code: "INVALID_FILE_TYPE",
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
