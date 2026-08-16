import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
})

export const interviewStartSchema = z.object({
  interviewType: z.enum(["BEHAVIORAL", "TECHNICAL", "CASE_STUDY", "MIXED"]),
  difficulty: z.enum(["ENTRY", "MID", "SENIOR", "STAFF"]),
  questionCount: z.number().int().min(1).max(20),
  mode: z.enum(["TEXT", "VOICE", "VIDEO"]).default("TEXT"),
  resumeId: z.string().uuid().optional(),
  jdText: z.string().max(10000).optional(),
  jdUrl: z.string().url().optional(),
})

export const answerSubmitSchema = z.object({
  questionId: z.string().uuid(),
  responseText: z.string().min(1, "Answer cannot be empty").max(10000),
  responseTimeMs: z.number().int().min(0).optional(),
})

export const resumeUploadSchema = z.object({
  file: z.instanceof(File).refine((f) => f.size < 10 * 1024 * 1024, "File must be less than 10MB"),
})

export const skillGapSchema = z.object({
  targetRole: z.string().min(1).max(100),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string().nullable(),
    level: z.string().nullable(),
    yearsExp: z.number().nullable(),
  })).optional(),
})

export const jdAnalysisSchema = z.object({
  jdText: z.string().min(10, "Job description too short").max(20000),
  skills: z.array(z.object({
    name: z.string(),
    category: z.string().nullable(),
    level: z.string().nullable(),
  })).optional(),
})

export const resumeTextSchema = z.object({
  resumeText: z.string().min(1, "Resume text is required").max(20000),
})
