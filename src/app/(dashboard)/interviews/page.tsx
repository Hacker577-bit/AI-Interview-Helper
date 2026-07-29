"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Play,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"
import { FormSkeleton } from "@/components/ui/skeleton"
import { Alert } from "@/components/ui/alert"

const inProgressSessions = [
  {
    id: "1",
    type: "Behavioral",
    difficulty: "Mid",
    questionCount: 10,
    answered: 3,
    startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    type: "Technical",
    difficulty: "Senior",
    questionCount: 15,
    answered: 7,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
]

export default function InterviewsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    interviewType: "BEHAVIORAL",
    difficulty: "MID",
    questionCount: 10,
    mode: "TEXT" as const,
    jobDescription: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    setStarting(true)
    setError(null)
    setTimeout(() => {
      setStarting(false)
      router.push("/interviews/new")
    }, 600)
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

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Interview</h2>
        <p className="text-muted-foreground">
          Configure your interview session and start practicing.
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible title="Failed to start interview">
          {error}
        </Alert>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-5">
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
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="TECHNICAL">Technical</option>
              <option value="CASE_STUDY">Case Study</option>
              <option value="MIXED">Mixed</option>
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
              <option value="ENTRY">Entry</option>
              <option value="MID">Mid</option>
              <option value="SENIOR">Senior</option>
              <option value="STAFF">Staff</option>
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
                    "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                    formData.questionCount === count
                      ? "border-primary bg-primary/10 text-primary"
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
              <button
                className={cn(
                  "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  "border-primary bg-primary/10 text-primary"
                )}
              >
                Text
              </button>
              <button
                disabled
                className="relative rounded-lg border px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
              >
                Voice
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Soon
                </span>
              </button>
              <button
                disabled
                className="relative rounded-lg border px-4 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
              >
                Video
                <span className="absolute -right-2 -top-2 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Soon
                </span>
              </button>
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
            onClick={handleStart}
            disabled={starting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {starting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
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
            {inProgressSessions.map((session) => (
              <button
                key={session.id}
                className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {session.type} ({session.difficulty})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.answered}/{session.questionCount} questions answered
                      {" · "}
                      {formatRelativeTime(session.startedAt)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
