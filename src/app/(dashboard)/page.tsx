"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  MessageSquare,
  TrendingUp,
  Flame,
  Award,
  ArrowRight,
  Eye,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { DashboardSkeleton } from "@/components/ui/skeleton"
import { Alert } from "@/components/ui/alert"

const stats = [
  {
    label: "Total Interviews",
    value: 12,
    icon: MessageSquare,
    color: "blue",
  },
  {
    label: "Average Score",
    value: 85,
    icon: TrendingUp,
    color: "green",
    suffix: "%",
  },
  {
    label: "Current Streak",
    value: 5,
    icon: Flame,
    color: "orange",
    suffix: " days",
  },
  {
    label: "Badges Earned",
    value: 7,
    icon: Award,
    color: "purple",
  },
]

const colorVariants: Record<string, { bg: string; text: string; darkBg: string }> = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    darkBg: "dark:bg-blue-900/30",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    darkBg: "dark:bg-green-900/30",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    darkBg: "dark:bg-orange-900/30",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    darkBg: "dark:bg-purple-900/30",
  },
}

const scoreTrendData = [
  { day: "Mon", score: 72 },
  { day: "Tue", score: 78 },
  { day: "Wed", score: 75 },
  { day: "Thu", score: 82 },
  { day: "Fri", score: 85 },
  { day: "Sat", score: 88 },
  { day: "Sun", score: 85 },
]

const skillRadarData = [
  { skill: "Clarity", score: 8 },
  { skill: "Relevance", score: 9 },
  { skill: "Depth", score: 7 },
  { skill: "Impact", score: 8 },
  { skill: "Delivery", score: 6 },
]

const recentInterviews = [
  {
    id: "1",
    date: "2026-07-27",
    type: "Behavioral",
    score: 88,
    duration: "25m",
    status: "Completed",
  },
  {
    id: "2",
    date: "2026-07-26",
    type: "Technical",
    score: 82,
    duration: "45m",
    status: "Completed",
  },
  {
    id: "3",
    date: "2026-07-25",
    type: "Case Study",
    score: 85,
    duration: "30m",
    status: "Completed",
  },
  {
    id: "4",
    date: "2026-07-24",
    type: "Mixed",
    score: 78,
    duration: "35m",
    status: "Completed",
  },
  {
    id: "5",
    date: "2026-07-23",
    type: "Behavioral",
    score: 72,
    duration: "20m",
    status: "Completed",
  },
]

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400"
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <Alert variant="error" title="Failed to load dashboard">
          {error}
        </Alert>
        <div className="mt-4 text-center">
          <button
            onClick={() => { setLoading(true); setError(null); setTimeout(() => setLoading(false), 800) }}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, User!</h2>
        <p className="text-muted-foreground">
          Here is your interview performance overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const colors = colorVariants[stat.color]
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    colors.bg,
                    colors.darkBg
                  )}
                >
                  <stat.icon className={cn("h-6 w-6", colors.text)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2 transition-shadow hover:shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Score Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis domain={[50, 100]} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
          <h3 className="mb-4 text-lg font-semibold">Skill Radar</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="skill" className="text-xs" />
                <PolarRadiusAxis domain={[0, 10]} className="text-xs" />
                <Radar
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Interviews</h3>
          <Link
            href="/history"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Duration</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews.map((interview) => (
                <tr key={interview.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    {formatDate(interview.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">{interview.type}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-semibold", getScoreColor(interview.score))}>
                      {interview.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{interview.duration}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {interview.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href="/history"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Report
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <Link
          href="/interviews"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          <MessageSquare className="h-4 w-4" />
          Start New Interview
        </Link>
      </div>
    </div>
  )
}
