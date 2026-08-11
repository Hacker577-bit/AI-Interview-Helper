"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Upload,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  History,
  UploadCloud,
  X,
  Briefcase,
  Star,
  ArrowRight,
  Sparkles,
  Play,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDate, formatRelativeTime } from "@/lib/utils"
import { PdfViewer } from "@/components/resume/pdf-viewer"
import { Badge } from "@/components/ui/badge"
import type { Resume } from "@/types"
import { useRouter } from "next/navigation"

// ---------------------------------------------------------------------------
// Job recommendation engine (client-side rule-based matching)
// ---------------------------------------------------------------------------
const JOB_ROLES: {
  title: string
  keywords: string[]
  description: string
  level: string
}[] = [
  {
    title: "Frontend Developer",
    keywords: ["react", "javascript", "typescript", "html", "css", "vue", "angular", "next", "tailwind", "redux", "webpack"],
    description: "Build beautiful, interactive user interfaces for web applications.",
    level: "Mid-Senior",
  },
  {
    title: "Backend Developer",
    keywords: ["node", "python", "java", "go", "express", "django", "spring", "rest", "api", "postgresql", "mysql", "mongodb"],
    description: "Design and develop server-side logic and APIs.",
    level: "Mid-Senior",
  },
  {
    title: "Full Stack Developer",
    keywords: ["react", "node", "javascript", "typescript", "mongodb", "postgresql", "express", "next", "graphql"],
    description: "Work across the entire application stack, from UI to database.",
    level: "Mid-Senior",
  },
  {
    title: "Data Scientist",
    keywords: ["python", "machine learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit", "sql", "statistics", "data analysis", "deep learning"],
    description: "Build predictive models and extract insights from large datasets.",
    level: "Senior",
  },
  {
    title: "Machine Learning Engineer",
    keywords: ["python", "tensorflow", "pytorch", "ml", "machine learning", "deep learning", "nlp", "computer vision", "docker", "kubernetes"],
    description: "Design and deploy scalable ML pipelines and AI systems.",
    level: "Senior",
  },
  {
    title: "DevOps Engineer",
    keywords: ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "jenkins", "linux", "git", "ansible"],
    description: "Manage cloud infrastructure and automate deployment pipelines.",
    level: "Mid-Senior",
  },
  {
    title: "Mobile Developer",
    keywords: ["react native", "flutter", "swift", "kotlin", "android", "ios", "xcode", "mobile", "dart"],
    description: "Build native and cross-platform mobile applications.",
    level: "Mid-Senior",
  },
  {
    title: "Data Engineer",
    keywords: ["spark", "hadoop", "kafka", "airflow", "sql", "python", "etl", "data pipeline", "bigquery", "snowflake"],
    description: "Design and maintain data pipelines and warehouses.",
    level: "Senior",
  },
  {
    title: "Cloud Engineer",
    keywords: ["aws", "azure", "gcp", "cloud", "terraform", "serverless", "lambda", "s3", "ec2", "kubernetes"],
    description: "Architect and manage cloud-native solutions at scale.",
    level: "Senior",
  },
  {
    title: "Software Engineer",
    keywords: ["java", "c++", "c#", "python", "algorithms", "data structures", "oop", "design patterns", "git"],
    description: "Develop robust, scalable software across various platforms.",
    level: "Junior-Senior",
  },
  {
    title: "Product Manager",
    keywords: ["product management", "roadmap", "agile", "scrum", "user research", "analytics", "jira", "figma", "stakeholder"],
    description: "Define product vision and coordinate cross-functional teams.",
    level: "Senior",
  },
  {
    title: "UX/UI Designer",
    keywords: ["figma", "sketch", "adobe xd", "ui", "ux", "design", "wireframe", "prototyping", "user research", "accessibility"],
    description: "Design intuitive and visually stunning user experiences.",
    level: "Mid-Senior",
  },
]

interface JobMatch {
  title: string
  description: string
  level: string
  score: number
  matchedKeywords: string[]
}

function getJobRecommendations(resume: Resume): JobMatch[] {
  // Collect all text from skills, experiences, and parsedText
  const skillNames = (resume.skills || []).map((s) => s.name.toLowerCase())
  const expTitles = (resume.experiences || []).flatMap((e) =>
    [e.title, e.company, e.description].filter(Boolean).map((t) => t!.toLowerCase())
  )
  const parsedLower = (resume.parsedText || "").toLowerCase()
  const allText = [...skillNames, ...expTitles, parsedLower].join(" ")

  const matches: JobMatch[] = []

  for (const role of JOB_ROLES) {
    const matchedKeywords = role.keywords.filter((kw) => allText.includes(kw.toLowerCase()))
    const score = Math.round((matchedKeywords.length / role.keywords.length) * 100)
    if (score >= 15) {
      matches.push({
        title: role.title,
        description: role.description,
        level: role.level,
        score,
        matchedKeywords: matchedKeywords.slice(0, 5),
      })
    }
  }

  // Sort by score desc, return top 4
  return matches.sort((a, b) => b.score - a.score).slice(0, 4)
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      : score >= 40
      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", color)}>
      {score}% match
    </span>
  )
}

export default function ResumePage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [showParsed, setShowParsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([])
  const [startingInterview, setStartingInterview] = useState(false)
  const [showUploader, setShowUploader] = useState(false)

  const handleStartTailoredInterview = async (roleTitle?: string) => {
    setStartingInterview(true)
    try {
      const jdText = roleTitle
        ? `I am interviewing for the role of ${roleTitle}. Please focus questions on the relevant skills, tools, and domain knowledge expected for this position.`
        : undefined

      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: "MIXED",
          difficulty: "MID",
          questionCount: 10,
          mode: "TEXT",
          resumeId: currentResume?.id || undefined,
          jdText,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to start interview")
      
      toast.success("Tailored interview generated!")
      router.push(`/dashboard/interviews/${data.session.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start interview")
      setStartingInterview(false)
    }
  }

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resume/list")
      if (res.ok) {
        const data = await res.json()
        setResumes(data.resumes || [])
        const curr = (data.resumes || []).find((r: Resume) => r.isCurrent) || null
        setCurrentResume(curr)
        if (curr) {
          setJobMatches(getJobRecommendations(curr))
        }
      }
    } catch (err) {
      console.error("Failed to fetch resumes", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const validateFile = (f: File): string | null => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ]
    const allowedExtensions = [".pdf", ".docx", ".txt"]
    const extension = "." + f.name.split(".").pop()?.toLowerCase()

    const typeOk = allowedTypes.includes(f.type)
    const extOk = allowedExtensions.includes(extension)

    if (!typeOk && !extOk) {
      return "Invalid file type. Only PDF, DOCX, and TXT files are allowed"
    }
    if (f.size > 10 * 1024 * 1024) {
      return `File too large. Maximum size is 10MB (your file is ${(f.size / (1024 * 1024)).toFixed(1)}MB)`
    }
    return null
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    setFileError(null)

    const droppedFile = e.dataTransfer.files[0]
    if (!droppedFile) return

    const err = validateFile(droppedFile)
    if (err) {
      setFileError(err)
      return
    }

    setPendingFile(droppedFile)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const err = validateFile(selectedFile)
    if (err) {
      setFileError(err)
      return
    }

    setPendingFile(selectedFile)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!pendingFile) return

    setUploading(true)
    setUploadProgress(0)
    setFileError(null)

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 20
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("file", pendingFile)

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Upload failed")
      }

      const data = await res.json()
      toast.success("Resume uploaded and parsed successfully")
      if (data.extractionNote) {
        toast.info(data.extractionNote)
      }

      setPendingFile(null)
      setShowUploader(false)
      await fetchResumes()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setFileError(message)
      toast.error(message)
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      setUploadProgress(0)
    }
  }, [pendingFile, fetchResumes])

  const handleSetCurrent = useCallback(async (resumeId: string) => {
    try {
      const res = await fetch(`/api/resume/${resumeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCurrent: true }),
      })

      if (!res.ok) throw new Error("Failed to update")
      toast.success("Set as current resume")
      await fetchResumes()
    } catch (err) {
      toast.error("Failed to update resume")
    }
  }, [fetchResumes])

  const cancelPending = useCallback(() => {
    setPendingFile(null)
    setFileError(null)
    setUploadProgress(0)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Resume</h2>
          <p className="text-muted-foreground mt-1">
            Upload and manage your resume for tailored interview questions.
          </p>
        </div>
        {currentResume && !showUploader && (
          <button
            onClick={() => setShowUploader(true)}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors"
          >
            <UploadCloud className="h-4 w-4" />
            Upload New
          </button>
        )}
      </div>

      {!uploading && (!currentResume || showUploader) && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors cursor-pointer",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
          )}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {pendingFile ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="h-12 w-12 text-primary" />
              <div className="text-center">
                <p className="font-medium">{pendingFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(pendingFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleUpload()
                  }}
                  className="relative z-10 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload & Parse
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    cancelPending()
                  }}
                  className="relative z-10 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-accent bg-background"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <Upload className={cn(
                "h-12 w-12 mb-4 transition-colors",
                dragActive ? "text-primary" : "text-muted-foreground"
              )} />
              <p className="text-lg font-medium">
                Drag &amp; drop your resume or click to browse
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports PDF, DOCX, and TXT files (max 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {uploading && (
        <div className="rounded-xl border p-6 bg-card">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="font-medium">Uploading &amp; parsing resume...</span>
            <span className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          {uploadProgress < 30 && (
            <p className="mt-2 text-xs text-muted-foreground">Reading file...</p>
          )}
          {uploadProgress >= 30 && uploadProgress < 60 && (
            <p className="mt-2 text-xs text-muted-foreground">Extracting text...</p>
          )}
          {uploadProgress >= 60 && uploadProgress < 90 && (
            <p className="mt-2 text-xs text-muted-foreground">Saving to storage...</p>
          )}
          {uploadProgress >= 90 && (
            <p className="mt-2 text-xs text-muted-foreground">Finalizing...</p>
          )}
        </div>
      )}

      {fileError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{fileError}</p>
        </div>
      )}

      {currentResume && (
        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentResume.fileName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground">
                      Uploaded {formatDate(currentResume.createdAt)}
                    </p>
                    <Badge variant="success">Current</Badge>
                  </div>
                </div>
              </div>
            </div>

            {currentResume.fileUrl && (
              <div className="mt-4">
                <PdfViewer fileUrl={currentResume.fileUrl} fileName={currentResume.fileName} />
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-card shadow-sm">
            <button
              onClick={() => setShowParsed(!showParsed)}
              className="flex w-full items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-2">
                {showParsed ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <h3 className="font-semibold">Parsed Data Preview</h3>
              </div>
              <span className="text-sm text-muted-foreground">
                {showParsed ? "Hide" : "View"}
              </span>
            </button>

            {showParsed && currentResume.parsedText && (
              <div className="border-t px-6 pb-6">
                <h4 className="mb-2 text-sm font-semibold text-muted-foreground">
                  Extracted Text
                </h4>
                <div className="rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {currentResume.parsedText}
                </div>
              </div>
            )}

            {showParsed && currentResume.skills && currentResume.skills.length > 0 && (
              <div className="border-t px-6 pb-6 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                  Skills ({currentResume.skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentResume.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {showParsed && currentResume.experiences && currentResume.experiences.length > 0 && (
              <div className="border-t px-6 pb-6 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                  Experience ({currentResume.experiences.length})
                </h4>
                <div className="space-y-4">
                  {currentResume.experiences.map((exp, i) => (
                    <div key={exp.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {i < currentResume.experiences!.length - 1 && (
                          <div className="h-full w-0.5 bg-border" />
                        )}
                      </div>
                      <div className="pb-2">
                        <p className="text-sm font-medium">{exp.title}</p>
                        <p className="text-sm text-muted-foreground">{exp.company}</p>
                        {exp.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showParsed && currentResume.educations && currentResume.educations.length > 0 && (
              <div className="border-t px-6 pb-6 pt-4">
                <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                  Education ({currentResume.educations.length})
                </h4>
                <div className="space-y-3">
                  {currentResume.educations.map((edu) => (
                    <div key={edu.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">{edu.school}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Tailored Interview Quick Start                                    */}
          {/* ---------------------------------------------------------------- */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Start Tailored Interview
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Instantly generate an AI interview based directly on this resume&apos;s parsed skills and experience.
                </p>
              </div>
              <button
                onClick={() => handleStartTailoredInterview()}
                disabled={startingInterview}
                className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {startingInterview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start Interview Now
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Job Recommendations                                               */}
          {/* ---------------------------------------------------------------- */}
          {jobMatches.length > 0 && (
            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Recommended Jobs</h3>
                  <p className="text-xs text-muted-foreground">Based on your CV skills &amp; experience</p>
                </div>
              </div>
              <div className="divide-y">
                {jobMatches.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-start justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm">{job.title}</h4>
                          <ScoreBadge score={job.score} />
                          <span className="text-xs text-muted-foreground">{job.level}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{job.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {job.matchedKeywords.map((kw) => (
                            <span
                              key={kw}
                              className="inline-flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary"
                            >
                              <Star className="h-2.5 w-2.5" />
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleStartTailoredInterview(job.title)}
                      disabled={startingInterview}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {startingInterview ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Practice Role
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {resumes.length > 1 && (
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="flex items-center gap-2 p-6 pb-3">
                <History className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Version History</h3>
                <span className="text-sm text-muted-foreground">({resumes.length} total)</span>
              </div>
              <div className="px-6 pb-4 space-y-2">
                {resumes
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((resume) => (
                    <div
                      key={resume.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border p-3",
                        resume.isCurrent && "border-primary/50 bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{resume.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(resume.createdAt)}
                          </p>
                        </div>
                        {resume.isCurrent && (
                          <Badge variant="success" className="shrink-0">Current</Badge>
                        )}
                      </div>
                      {!resume.isCurrent && (
                        <button
                          onClick={() => handleSetCurrent(resume.id)}
                          className="shrink-0 text-sm text-primary hover:underline ml-3"
                        >
                          Set as Current
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
