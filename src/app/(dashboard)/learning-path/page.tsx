"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  GraduationCap,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CardSkeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

interface PathItem {
  id: string
  title: string
  type: "COURSE" | "PROJECT" | "PRACTICE" | "READING"
  hours: number
  completed: boolean
}

interface PathWeek {
  week: number
  title: string
  items: PathItem[]
}

interface LearningPathData {
  title: string
  progress: number
  weeks: PathWeek[]
}

const mockLearningPath: LearningPathData = {
  title: "Senior Software Engineer Roadmap",
  progress: 35,
  weeks: [
    {
      week: 1,
      title: "Foundations",
      items: [
        { id: "1", title: "System Design Fundamentals", type: "COURSE", hours: 8, completed: true },
        { id: "2", title: "Design a URL Shortener", type: "PROJECT", hours: 5, completed: true },
        { id: "3", title: "Mock System Design Interview", type: "PRACTICE", hours: 2, completed: false },
      ],
    },
    {
      week: 2,
      title: "Advanced Patterns",
      items: [
        { id: "4", title: "Distributed Systems Patterns", type: "COURSE", hours: 10, completed: false },
        { id: "5", title: "Design a Chat System", type: "PROJECT", hours: 6, completed: false },
        { id: "6", title: "CAP Theorem Deep Dive", type: "READING", hours: 3, completed: false },
      ],
    },
    {
      week: 3,
      title: "Practical Application",
      items: [
        { id: "7", title: "Mock Interview - Senior Level", type: "PRACTICE", hours: 2, completed: false },
        { id: "8", title: "Behavioral Response Framework", type: "COURSE", hours: 4, completed: false },
        { id: "9", title: "Design a Payment System", type: "PROJECT", hours: 8, completed: false },
      ],
    },
  ],
}

const typeConfig: Record<PathItem["type"], { label: string; color: string }> = {
  COURSE: { label: "Course", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  PROJECT: { label: "Project", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  PRACTICE: { label: "Practice", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  READING: { label: "Reading", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
}

export default function LearningPathPage() {
  const [loading, setLoading] = useState(true)
  const [hasPath] = useState(true)
  const [items, setItems] = useState<LearningPathData>(mockLearningPath)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const toggleItem = (itemId: string) => {
    setItems((prev) => ({
      ...prev,
      weeks: prev.weeks.map((week) => ({
        ...week,
        items: week.items.map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        ),
      })),
    }))
  }

  const allItems = items.weeks.flatMap((w) => w.items)
  const completedCount = allItems.filter((i) => i.completed).length
  const totalCount = allItems.length

  const progress = Math.round((completedCount / totalCount) * 100)

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

  if (!hasPath) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={GraduationCap}
          title="No learning path yet"
          description="Generate your personalized learning roadmap based on your skill gaps and target role."
          action={
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <GraduationCap className="h-4 w-4" />
              Generate Your Learning Roadmap
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{items.title}</h2>
        <p className="text-muted-foreground">
          Track your progress through the personalized learning plan.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {completedCount}/{totalCount} completed
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-right text-sm font-bold text-primary">
          {progress}%
        </p>
      </div>

      <div className="relative space-y-0">
        <div className="absolute left-6 top-0 h-full w-0.5 bg-border" />
        {items.weeks.map((week, weekIdx) => (
          <div key={week.week} className="relative pb-8 pl-16">
            <div className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-background bg-primary text-sm font-bold text-primary-foreground shadow-sm">
              W{week.week}
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <h4 className="mb-4 text-lg font-semibold">{week.title}</h4>
              <div className="space-y-3">
                {week.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
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
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            typeConfig[item.type].color
                          )}
                        >
                          {typeConfig[item.type].label}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.hours}h
                        </span>
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
