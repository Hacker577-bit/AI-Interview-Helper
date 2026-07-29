export type InterviewType = "BEHAVIORAL" | "TECHNICAL" | "CASE_STUDY" | "MIXED"
export type DifficultyLevel = "ENTRY" | "MID" | "SENIOR" | "STAFF"
export type InterviewMode = "TEXT" | "VOICE" | "VIDEO"
export type SessionStatus = "CREATED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED"
export type PlanTier = "FREE" | "PRO" | "ENTERPRISE"

export interface UserProfile {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  targetRole: string | null
  experienceLevel: string | null
  planTier: PlanTier
  stripeCustomerId: string | null
  interviewUsageMonth: number
  interviewUsageReset: string | null
  createdAt: string
}

export interface Resume {
  id: string
  userId: string
  fileUrl: string | null
  fileName: string
  parsedText: string | null
  isCurrent: boolean
  skills: ParsedSkill[]
  experiences: ParsedExperience[]
  educations: ParsedEducation[]
  createdAt: string
}

export interface ParsedSkill {
  id: string
  name: string
  category: string | null
  level: string | null
  yearsExp: number | null
}

export interface ParsedExperience {
  id: string
  company: string
  title: string
  startDate: string | null
  endDate: string | null
  description: string | null
  highlights: string[] | null
}

export interface ParsedEducation {
  id: string
  school: string
  degree: string | null
  field: string | null
  startYear: number | null
  endYear: number | null
}

export interface InterviewSession {
  id: string
  userId: string
  resumeId: string | null
  jdText: string | null
  jdUrl: string | null
  interviewType: InterviewType
  difficulty: DifficultyLevel
  mode: InterviewMode
  status: SessionStatus
  questionCount: number
  startedAt: string | null
  endedAt: string | null
  questions: InterviewQuestion[]
  feedbackReport: FeedbackReport | null
  createdAt: string
}

export interface InterviewQuestion {
  id: string
  sessionId: string
  sequenceNumber: number
  questionText: string
  questionType: string | null
  category: string | null
  isAnswered: boolean
  responses: QuestionResponse[]
}

export interface QuestionResponse {
  id: string
  questionId: string
  responseText: string | null
  audioUrl: string | null
  transcribedText: string | null
  responseTimeMs: number | null
  wordCount: number | null
}

export interface FeedbackReport {
  id: string
  sessionId: string
  overallScore: number | null
  dimensionScores: DimensionScores | null
  strengths: string[] | null
  weaknesses: string[] | null
  summary: string | null
  generatedAt: string
}

export interface DimensionScores {
  clarity: number
  relevance: number
  depth: number
  impact: number
  delivery: number
}

export interface SkillGapAnalysis {
  currentSkills: string[]
  targetSkills: string[]
  gaps: SkillGap[]
  recommendations: string[]
}

export interface SkillGap {
  skill: string
  demandLevel: "HIGH" | "MEDIUM" | "LOW"
  currentProficiency: number
  targetProficiency: number
  learningHours: number
}

export interface LearningPath {
  id: string
  title: string
  goalRole: string | null
  items: LearningPathItem[]
  progress: number
}

export interface LearningPathItem {
  id: string
  title: string
  type: "COURSE" | "PROJECT" | "PRACTICE" | "READING"
  resourceUrl: string | null
  estimatedHours: number
  completed: boolean
  week: number
}

export interface DashboardStats {
  totalInterviews: number
  averageScore: number
  currentStreak: number
  badgesEarned: number
  recentSessions: InterviewSession[]
  scoreTrend: { date: string; score: number }[]
  skillRadar: { skill: string; score: number }[]
}

export interface ATSAnalysis {
  overallScore: number
  keywordMatch: number
  formatScore: number
  contentScore: number
  missingKeywords: string[]
  suggestions: string[]
}
