"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

interface PathItem {
  id: string
  title: string
  type: "COURSE" | "PROJECT" | "PRACTICE" | "READING"
  resourceUrl: string | null
  estimatedHours: number
  completed: boolean
  week: number
}

const typeConfig: Record<PathItem["type"], { label: string; color: string }> = {
  COURSE: { label: "Course", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROJECT: { label: "Project", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  PRACTICE: { label: "Practice", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  READING: { label: "Reading", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
}

export default function LearningPathPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pathId, setPathId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [goalRole, setGoalRole] = useState<string | null>(null)
  const [items, setItems] = useState<PathItem[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/ai/learning-path", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { learningPath: null }))
      .then((data) => {
        if (data.learningPath) {
          setPathId(data.learningPath.id)
          setTitle(data.learningPath.title)
          setGoalRole(data.learningPath.goalRole)
          setItems(data.learningPath.items || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const persist = useCallback(
    async (nextItems: PathItem[]) => {
      if (!pathId) return
      setSaving(true)
      try {
        const total = nextItems.length
        const done = nextItems.filter((i) => i.completed).length
        const progress = total > 0 ? Math.round((done / total) * 100) : 0
        await fetch(`/api/ai/learning-path/${pathId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: nextItems, progress }),
        })
      } catch {
        // silent - keep local state
      } finally {
        setSaving(false)
      }
    },
    [pathId]
  )

  const toggleItem = (itemId: string) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
      persist(next)
      return next
    })
  }

  const weeks = Array.from(new Set(items.map((i) => i.week).filter((w) => w > 0)))
  const weekGroups = weeks.map((week) => ({
    week,
    title: `Week ${week}`,
    items: items.filter((i) => i.week === week),
  }))

  const completedCount = items.filter((i) => i.completed).length
  const totalCount = items.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const totalHours = items.reduce((sum, i) => sum + (i.estimatedHours || 0), 0)

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={GraduationCap}
          title="No learning path yet"
          description="Generate your personalized AI learning roadmap based on your skill gaps and target role."
          action={
            <button
              onClick={() => router.push("/dashboard/skill-gap")}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your Learning Roadmap
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            {title}
          </h2>
          <p className="text-muted-foreground">
            {goalRole ? `Personalized roadmap for ${goalRole}` : "Track your progress through the personalized learning plan."}
          </p>
        </div>
        {saving && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-transparent p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            Overall Progress
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-muted-foreground">
              {completedCount}/{totalCount} completed
            </span>
            <span className="hidden items-center gap-1 text-muted-foreground sm:flex">
              <Clock className="h-3.5 w-3.5" />
              {totalHours}h planned
            </span>
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-right text-sm font-bold text-primary">{progress}%</p>
      </div>

      <div className="relative space-y-0">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-primary/40 to-transparent" />
        {weekGroups.map((week, weekIdx) => (
          <div key={week.week} className="relative pb-8 pl-16">
            <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-white shadow-lg">
              W{week.week}
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
              <h4 className="mb-4 text-lg font-semibold">{week.title}</h4>
              <div className="space-y-3">
                {week.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 flex-shrink-0 text-muted-foreground transition-colors hover:text-primary"
                      aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-medium",
                            item.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {item.title}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            typeConfig[item.type].color
                          )}
                        >
                          {typeConfig[item.type].label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.estimatedHours}h
                        </span>
                        {item.resourceUrl && (
                          <a
                            href={item.resourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Resource
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
