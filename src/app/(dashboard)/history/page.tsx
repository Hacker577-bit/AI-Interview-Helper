"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, ChevronDown, ChevronUp, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { TableSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Alert } from "@/components/ui/alert"

type FilterType = "All" | "Behavioral" | "Technical" | "Case Study" | "Mixed"

const filterOptions: FilterType[] = ["All", "Behavioral", "Technical", "Case Study", "Mixed"]

const mockInterviews = [
  { id: "1", date: "2026-07-27", type: "Behavioral", score: 88, questions: 8, duration: "25m" },
  { id: "2", date: "2026-07-26", type: "Technical", score: 82, questions: 12, duration: "45m" },
  { id: "3", date: "2026-07-25", type: "Case Study", score: 55, questions: 5, duration: "30m" },
  { id: "4", date: "2026-07-24", type: "Mixed", score: 78, questions: 15, duration: "35m" },
  { id: "5", date: "2026-07-20", type: "Behavioral", score: 72, questions: 10, duration: "22m" },
  { id: "6", date: "2026-07-18", type: "Technical", score: 91, questions: 10, duration: "40m" },
  { id: "7", date: "2026-07-15", type: "Technical", score: 67, questions: 15, duration: "38m" },
  { id: "8", date: "2026-07-12", type: "Mixed", score: 84, questions: 8, duration: "28m" },
]

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400"
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

function getScoreBg(score: number) {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30"
  if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30"
  return "bg-red-100 dark:bg-red-900/30"
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>("All")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const filteredInterviews =
    activeFilter === "All"
      ? mockInterviews
      : mockInterviews.filter((i) => i.type === activeFilter)

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex gap-2">
          {filterOptions.map((f) => (
            <div key={f} className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
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
      <div className="mx-auto max-w-4xl py-12">
        <Alert variant="error" title="Failed to load history">
          {error}
        </Alert>
      </div>
    )
  }

  if (mockInterviews.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon={Play}
          title="No interviews yet"
          description="Start your first interview to begin tracking your progress."
          action={
            <Link
              href="/interviews"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Play className="h-4 w-4" />
              Start Your First Interview
            </Link>
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

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {filteredInterviews.length === 0 ? (
        <EmptyState
          title="No results"
          description={`No interviews found for "${activeFilter}". Try a different filter.`}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Questions</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((interview) => (
                <tr key={interview.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm">{formatDate(interview.date)}</td>
                  <td className="px-4 py-3 text-sm">{interview.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        getScoreBg(interview.score),
                        getScoreColor(interview.score)
                      )}
                    >
                      {interview.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{interview.questions}</td>
                  <td className="px-4 py-3 text-sm">{interview.duration}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === interview.id ? null : interview.id)
                      }
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View
                      {expandedId === interview.id ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expandedId && (
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <h4 className="mb-4 text-lg font-semibold">Session Summary</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Overall Score:</span>{" "}
                <span className="font-semibold">
                  {mockInterviews.find((i) => i.id === expandedId)?.score}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Duration:</span>{" "}
                <span className="font-semibold">
                  {mockInterviews.find((i) => i.id === expandedId)?.duration}
                </span>
              </div>
            </div>
            <div>
              <h5 className="mb-1 text-sm font-medium">Strengths</h5>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                <li>Clear and structured responses</li>
                <li>Good use of examples</li>
                <li>Strong closing statements</li>
              </ul>
            </div>
            <div>
              <h5 className="mb-1 text-sm font-medium">Areas to Improve</h5>
              <ul className="list-inside list-disc space-y-0.5 text-sm text-muted-foreground">
                <li>Reduce filler words</li>
                <li>More concise answers for technical questions</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
