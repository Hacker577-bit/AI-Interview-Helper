"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Play,
  Clock,
  ChevronRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Brain,
  ListChecks,
  Mic,
  FileText,
  Briefcase,
  X,
  AlertCircle,
} from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import { FormSkeleton } from "@/components/ui/skeleton"
import { Alert } from "@/components/ui/alert"
import type { Resume } from "@/types"

interface InProgressSession {
  id: string
  interviewType: string
  difficulty: string
  questionCount: number
  status: string
  answeredCount: number
  startedAt: string | null
}

const TYPE_LABELS: Record<string, string> = {
  BEHAVIORAL: "Behavioral",
  TECHNICAL: "Technical",
  CASE_STUDY: "Case Study",
  MIXED: "Mixed",
}

const DIFFICULTY_LABELS: Record<string, string> = {
  ENTRY: "Entry",
  MID: "Mid",
  SENIOR: "Senior",
  STAFF: "Staff",
}

export default function InterviewsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const startButtonRef = useRef<HTMLButtonElement>(null)

  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inProgressSessions, setInProgressSessions] = useState<InProgressSession[]>([])
  const [currentResume, setCurrentResume] = useState<Resume | null>(null)
  const [resumeDismissed, setResumeDismissed] = useState(false)

  // Feature B: role pre-fill from ?role= query param (set by the Practice button on Resume tab)
  const roleParam = searchParams.get("role") || ""

  const [formData, setFormData] = useState({
    interviewType: "MIXED",
    difficulty: "MID",
    questionCount: 10,
    mode: "TEXT" as string,
    jobDescription: roleParam
      ? `I am interviewing for the role of ${roleParam}. Please focus questions on the relevant skills, tools, and domain knowledge expected for this position.`
      : "",
  })

  // Sync jobDescription if roleParam is set on first render (handles hydration timing)
  useEffect(() => {
    if (roleParam && !formData.jobDescription) {
      setFormData((prev) => ({
        ...prev,
        interviewType: "MIXED",
        jobDescription: `I am interviewing for the role of ${roleParam}. Please focus questions on the relevant skills, tools, and domain knowledge expected for this position.`,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleParam])

  // Scroll to start button when arriving from Practice CTA
  useEffect(() => {
    if (roleParam) {
      setTimeout(() => {
        startButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 600)
    }
  }, [roleParam])

  // Feature A + B: fetch both interview list and current resume in parallel
  useEffect(() => {
    const controller = new AbortController()
    Promise.all([
      new Promise((r) => setTimeout(r, 300)),
      fetch("/api/interview/list", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { sessions: [] }))
        .then((data) => {
          const active = (data.sessions || []).filter(
            (s: InProgressSession) => s.status === "IN_PROGRESS"
          )
          setInProgressSessions(active)
        })
        .catch(() => {}),
      fetch("/api/resume/list", { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : { resumes: [] }))
        .then((data) => {
          const current =
            (data.resumes || []).find((r: Resume) => r.isCurrent) || null
          setCurrentResume(current)
        })
        .catch(() => {}),
    ]).finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const handleStart = async () => {
    setStarting(true)
    setError(null)
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewType: formData.interviewType,
          difficulty: formData.difficulty,
          questionCount: formData.questionCount,
          mode: formData.mode,
          jdText: formData.jobDescription || undefined,
          // Feature A: explicitly pass resumeId; backend will also auto-attach as fallback
          resumeId: currentResume?.id || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to start interview")
      }
      router.push(`/dashboard/interviews/${data.session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview")
    } finally {
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="rounded-xl border bg-card p-6">
          <FormSkeleton fields={5} />
        </div>
      </div>
    )
  }

  const modeOptions = [
    { value: "TEXT", label: "Text", icon: MessageSquare, enabled: true },
    { value: "VOICE", label: "Voice", icon: Mic, enabled: true },
    { value: "VIDEO", label: "Video", icon: Brain, enabled: false },
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            New Interview
          </h2>
          <p className="text-muted-foreground">
            Configure your interview session and start practicing with AI.
          </p>
        </div>
        {inProgressSessions.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            {inProgressSessions.length} in progress
          </span>
        )}
      </div>

      {/* ── Feature B: Role pre-fill banner ──────────────────────────────────── */}
      {roleParam && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-primary">
              🎯 Practicing for: {roleParam}
            </p>
            <p className="text-xs text-muted-foreground">
              Job description has been pre-filled from your recommendation. You can edit it below.
            </p>
          </div>
        </div>
      )}

      {/* ── Feature A: Resume indicator ───────────────────────────────────────── */}
      {!resumeDismissed && (
        currentResume ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                Using resume: {currentResume.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                Questions will be tailored to your skills and experience.
              </p>
            </div>
            <button
              onClick={() => setResumeDismissed(true)}
              className="shrink-0 rounded p-1 hover:bg-green-500/10 text-muted-foreground"
              aria-label="Dismiss resume notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/5 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                No resume uploaded
              </p>
              <p className="text-xs text-muted-foreground">
                Upload a CV for personalized, role-specific interview questions.{" "}
                <button
                  onClick={() => router.push("/dashboard/resume")}
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Add resume →
                </button>
              </p>
            </div>
            <button
              onClick={() => setResumeDismissed(true)}
              className="shrink-0 rounded p-1 hover:bg-amber-400/10 text-muted-foreground"
              aria-label="Dismiss resume notice"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      )}

      {error && (
        <Alert variant="error" dismissible title="Failed to start interview">
          {error}
        </Alert>
      )}

      <div className="overflow-hidden rounded-xl border bg-card shadow-card">
        <div className="border-b bg-gradient-to-r from-primary/10 to-transparent px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <ListChecks className="h-4 w-4 text-primary" />
            Interview Setup
          </h3>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Interview Type
            </label>
            <select
              value={formData.interviewType}
              onChange={(e) =>
                setFormData({ ...formData, interviewType: e.target.value })
              }
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData({ ...formData, difficulty: e.target.value })
              }
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Question Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setFormData({ ...formData, questionCount: count })}
                  className={cn(
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                    formData.questionCount === count
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "hover:bg-accent"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {modeOptions.map((mode) => (
                <button
                  key={mode.value}
                  disabled={!mode.enabled}
                  onClick={() => setFormData({ ...formData, mode: mode.value })}
                  className={cn(
                    "relative flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
                    formData.mode === mode.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-accent",
                    !mode.enabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                  {!mode.enabled && (
                    <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Job Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) =>
                setFormData({ ...formData, jobDescription: e.target.value })
              }
              placeholder="Paste a job description to get tailored questions..."
              rows={4}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            ref={startButtonRef}
            onClick={handleStart}
            disabled={starting}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 disabled:opacity-60"
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing your interview...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
                Start Interview
              </>
            )}
          </button>
        </div>
      </div>

      {inProgressSessions.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
            Or continue a previous interview
          </h3>
          <div className="space-y-2">
            {inProgressSessions.map((session) => {
              const answered = session.answeredCount || 0
              return (
                <button
                  key={session.id}
                  onClick={() => router.push(`/dashboard/interviews/${session.id}`)}
                  className="group flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left transition-all hover:border-primary/40 hover:shadow-card-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {TYPE_LABELS[session.interviewType] || session.interviewType}{" "}
                        ({DIFFICULTY_LABELS[session.difficulty] || session.difficulty})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {answered}/{session.questionCount} questions answered
                        {" · "}
                        {session.startedAt ? formatRelativeTime(session.startedAt) : "in progress"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
