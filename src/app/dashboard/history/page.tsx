"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Play, ArrowRight, RefreshCw, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Alert } from "@/components/ui/alert"

type FilterType = "All" | "BEHAVIORAL" | "TECHNICAL" | "CASE_STUDY" | "MIXED"

const TYPE_LABELS: Record<string, string> = {
  BEHAVIORAL: "Behavioral",
  TECHNICAL: "Technical",
  CASE_STUDY: "Case Study",
  MIXED: "Mixed",
}

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "All", label: "All" },
  { value: "BEHAVIORAL", label: "Behavioral" },
  { value: "TECHNICAL", label: "Technical" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "MIXED", label: "Mixed" },
]

interface Session {
  id: string
  interviewType: string
  difficulty: string
  mode: string
  status: string
  questionCount: number
  answeredCount: number
  overallScore: number | null
  startedAt: string | null
  endedAt: string | null
  createdAt: string
}

function getScoreColor(score: number) {
  if (score >= 8) return "text-green-600 dark:text-green-400"
  if (score >= 6) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

function getScoreBg(score: number) {
  if (score >= 8) return "bg-green-100 dark:bg-green-900/30"
  if (score >= 6) return "bg-yellow-100 dark:bg-yellow-900/30"
  return "bg-red-100 dark:bg-red-900/30"
}

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeTab, setActiveTab] = useState<"completed" | "inprogress">("completed")

  const fetchSessions = () => {
    setLoading(true)
    setError(null)
    const controller = new AbortController()

    Promise.all([
      new Promise((r) => setTimeout(r, 300)),
      fetch("/api/interview/list", { signal: controller.signal })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Server error: ${res.status}`)
          }
          return res.json()
        })
        .then((data) => {
          setSessions(data.sessions || [])
        }),
    ])
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load interview history. Please try again.")
        }
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }

  useEffect(() => {
    const cleanup = fetchSessions()
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED")
  const inProgressSessions = sessions.filter((s) => s.status !== "COMPLETED")

  const displaySessions = activeTab === "completed" ? completedSessions : inProgressSessions

  const filteredSessions =
    activeFilter === "All"
      ? displaySessions
      : displaySessions.filter((s) => s.interviewType === activeFilter)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((f) => (
            <div key={f.value} className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="rounded-xl border p-6">
          <TableSkeleton rows={6} cols={5} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl py-12 space-y-4">
        <Alert variant="error" title="Failed to load history">
          {error}
        </Alert>
        <div className="flex justify-center">
          <button
            onClick={fetchSessions}
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={Play}
          title="No interviews yet"
          description="Start your first interview to begin tracking your progress."
          action={
            <button
              onClick={() => router.push("/dashboard/interviews")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
            >
              <Play className="h-4 w-4" />
              Start Your First Interview
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Interview History</h2>
        <p className="text-muted-foreground">
          Review your past interview sessions and track your improvement.
        </p>
      </div>

      {/* Tabs: Completed / In Progress */}
      <div className="flex gap-1 rounded-xl border bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setActiveTab("completed")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            activeTab === "completed"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Completed
          {completedSessions.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {completedSessions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("inprogress")}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-all",
            activeTab === "inprogress"
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          In Progress
          {inProgressSessions.length > 0 && (
            <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              {inProgressSessions.length}
            </span>
          )}
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeFilter === filter.value
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {filteredSessions.length === 0 ? (
        <EmptyState
          title={activeTab === "completed" ? "No completed interviews" : "No in-progress interviews"}
          description={
            activeFilter !== "All"
              ? `No ${activeTab === "completed" ? "completed" : "in-progress"} interviews found for "${activeFilter}". Try a different filter.`
              : activeTab === "completed"
              ? "Complete an interview to see it here."
              : "Start a new interview to see it here."
          }
          action={
            activeTab === "completed" ? (
              <button
                onClick={() => router.push("/dashboard/interviews")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
              >
                <Play className="h-4 w-4" />
                Start an Interview
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Difficulty</th>
                  {activeTab === "completed" ? (
                    <>
                      <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Answered</th>
                    </>
                  ) : (
                    <th className="px-4 py-3 text-left text-sm font-medium">Progress</th>
                  )}
                  <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => {
                  const score = session.overallScore
                  const progressPct =
                    session.questionCount > 0
                      ? Math.round((session.answeredCount / session.questionCount) * 100)
                      : 0
                  return (
                    <tr key={session.id} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        {session.startedAt ? formatDate(session.startedAt) : formatDate(session.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {TYPE_LABELS[session.interviewType] || session.interviewType}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize text-muted-foreground">
                        {session.difficulty.toLowerCase()}
                      </td>
                      {activeTab === "completed" ? (
                        <>
                          <td className="px-4 py-3">
                            {score !== null ? (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                  getScoreBg(score),
                                  getScoreColor(score)
                                )}
                              >
                                {score.toFixed(1)}/10
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">No score</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {session.answeredCount}/{session.questionCount}
                          </td>
                        </>
                      ) : (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-orange-400"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {session.answeredCount}/{session.questionCount}
                            </span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        {activeTab === "completed" ? (
                          <button
                            onClick={() => router.push(`/dashboard/interviews/${session.id}/report`)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                          >
                            <Eye className="h-4 w-4" />
                            View Report
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/dashboard/interviews/${session.id}`)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 transition-colors hover:opacity-80"
                          >
                            <Clock className="h-4 w-4" />
                            Resume
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
