// Enhanced type definitions with better structure and validation
export interface Student {
  id: string
  name: string
  group: string
  status: "active" | "inactive"
  email?: string
  parentEmail?: string
  parentPhone?: string
  completionRate: number
  notes?: string
  createdAt: string
  updatedAt: string
  // Enhanced fields
  avatar?: string
  dateOfBirth?: string
  emergencyContact?: string
  preferences?: StudentPreferences
}

export interface StudentPreferences {
  notifications: boolean
  reminderFrequency: "daily" | "weekly" | "none"
  preferredLanguage: "ko" | "en"
}

// Enhanced Assignment interface with better validation
export interface Assignment {
  id: string
  title: string
  description: string
  dueDate: string // ISO date string
  assignedTo: string[]
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  type?: AssignmentType
  points?: number
  createdAt: string
  updatedAt: string
  // Enhanced fields
  estimatedDuration?: number // in minutes
  difficulty?: "easy" | "medium" | "hard"
  tags?: string[]
  attachments?: AssignmentAttachment[]
  submissionType?: "text" | "file" | "both"
}

export type AssignmentType = "homework" | "quiz" | "exam" | "project" | "reading" | "writing" | "speaking" | "listening"

export interface AssignmentAttachment {
  id: string
  name: string
  url: string
  type: "pdf" | "doc" | "image" | "video" | "audio"
  size: number
}

// Enhanced StudentAssignment with progress tracking
export interface StudentAssignment {
  studentId: string
  assignmentId: string
  status: "pending" | "in-progress" | "completed" | "overdue"
  submittedAt?: string
  grade?: number
  feedback?: string
  updatedAt: string
  // Enhanced fields
  timeSpent?: number // in minutes
  attempts?: number
  progress?: number // percentage 0-100
  lastAccessed?: string
}

// Enhanced Attendance with more detailed tracking
export interface Attendance {
  id: string
  studentId: string
  date: string // ISO date string
  status: "present" | "late" | "absent" | "excused"
  notes?: string
  createdAt: string
  // Enhanced fields
  arrivalTime?: string
  departureTime?: string
  temperature?: number
  healthCheck?: boolean
}

// Enhanced Grade with rubric support
export interface Grade {
  id: string
  studentId: string
  assignmentId: string
  score: number
  maxScore: number
  feedback?: string
  createdAt: string
  updatedAt: string
  // Enhanced fields
  rubricScores?: RubricScore[]
  gradedBy?: string
  isPublished?: boolean
}

export interface RubricScore {
  criteriaId: string
  criteriaName: string
  score: number
  maxScore: number
  feedback?: string
}

// Enhanced IntegrationConfig with better error handling
export interface IntegrationConfig {
  googleSheets: GoogleSheetsConfig
  googleForms: GoogleFormsConfig
  powerAutomate: PowerAutomateConfig
  zapier: ZapierConfig
}

export interface GoogleSheetsConfig {
  connected: boolean
  sheetId?: string
  lastSync?: string
  syncStatus?: "idle" | "syncing" | "error"
  errorMessage?: string
  autoSync?: boolean
  syncInterval?: number // in minutes
}

export interface GoogleFormsConfig {
  connected: boolean
  formIds: string[]
  lastSync?: string
  syncStatus?: "idle" | "syncing" | "error"
  errorMessage?: string
}

export interface PowerAutomateConfig {
  connected: boolean
  flows: PowerAutomateFlow[]
  apiKey?: string
  lastSync?: string
}

export interface PowerAutomateFlow {
  id: string
  name: string
  status: "active" | "inactive" | "error"
  lastRun?: string
  errorMessage?: string
  triggerType?: "manual" | "scheduled" | "webhook"
}

export interface ZapierConfig {
  connected: boolean
  zaps: ZapierZap[]
  apiKey?: string
  lastSync?: string
}

export interface ZapierZap {
  id: string
  name: string
  status: "on" | "off" | "error"
  lastRun?: string
  errorMessage?: string
  triggerType?: "webhook" | "polling" | "instant"
}

// Enhanced ClassGroup with more metadata
export interface ClassGroup {
  id: string
  name: string
  description?: string
  color?: string
  teacherId?: string
  schedule?: ClassSchedule[]
  maxStudents?: number
  currentStudents?: number
  createdAt: string
  updatedAt: string
}

export interface ClassSchedule {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  room?: string
}

// Enhanced NotificationSettings with granular controls
export interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  assignmentReminders: boolean
  gradeNotifications: boolean
  attendanceAlerts: boolean
  reminderDays: number
  // Enhanced settings
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm
    endTime: string // HH:mm
  }
  notificationTypes: {
    newAssignment: boolean
    dueReminder: boolean
    gradePosted: boolean
    attendanceAlert: boolean
    systemUpdate: boolean
  }
  frequency: {
    immediate: boolean
    daily: boolean
    weekly: boolean
  }
}

// API Response types for better error handling
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

// Filter and search types
export interface AssignmentFilters {
  status?: Assignment["status"][]
  priority?: Assignment["priority"][]
  type?: AssignmentType[]
  assignedTo?: string[]
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
}

export interface StudentFilters {
  status?: Student["status"][]
  groups?: string[]
  completionRateRange?: {
    min: number
    max: number
  }
}

// Analytics types
export interface AnalyticsData {
  studentPerformance: StudentPerformanceData[]
  assignmentStats: AssignmentStatsData
  attendanceStats: AttendanceStatsData
  classComparison: ClassComparisonData[]
}

export interface StudentPerformanceData {
  studentId: string
  studentName: string
  averageGrade: number
  completionRate: number
  attendanceRate: number
  trend: "improving" | "declining" | "stable"
  lastUpdated: string
}

export interface AssignmentStatsData {
  totalAssignments: number
  completedAssignments: number
  averageScore: number
  onTimeSubmissions: number
  lateSubmissions: number
  byType: Record<AssignmentType, number>
  byPriority: Record<Assignment["priority"], number>
}

export interface AttendanceStatsData {
  totalDays: number
  presentDays: number
  lateDays: number
  absentDays: number
  excusedDays: number
  attendanceRate: number
  byMonth: Record<string, number>
}

export interface ClassComparisonData {
  className: string
  averageGrade: number
  completionRate: number
  attendanceRate: number
  studentCount: number
}

// Validation schemas
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface FormValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
