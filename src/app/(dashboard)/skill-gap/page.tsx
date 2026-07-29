"use client"

import { useState, useEffect } from "react"
import {
  Target,
  TrendingUp,
  BookOpen,
  Loader2,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { CardSkeleton } from "@/components/ui/skeleton"

const mockGaps = [
  { skill: "System Design", current: 4, target: 8, gap: 4 },
  { skill: "Data Structures", current: 7, target: 9, gap: 2 },
  { skill: "Behavioral", current: 6, target: 8, gap: 2 },
  { skill: "Problem Solving", current: 8, target: 9, gap: 1 },
  { skill: "Communication", current: 5, target: 7, gap: 2 },
]

const radarData = mockGaps.map((g) => ({
  skill: g.skill,
  current: g.current,
  target: g.target,
}))

export default function SkillGapPage() {
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [targetRole, setTargetRole] = useState("Senior Software Engineer")
  const [analyzed, setAnalyzed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleAnalyze = () => {
    setAnalyzing(true)
    setTimeout(() => {
      setAnalyzed(true)
      setAnalyzing(false)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
        <CardSkeleton />
        <div className="grid gap-6 lg:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Skill Gap Analysis</h2>
        <p className="text-muted-foreground">
          Compare your current skills against your target role requirements.
        </p>
      </div>

      <div className="flex items-end gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex-1">
          <label className="mb-1.5 block text-sm font-medium">
            Target Role
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
            className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {analyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Target className="h-4 w-4" />
              Analyze Skills
            </>
          )}
        </button>
      </div>

      {analyzing && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing skill gaps...</p>
          </div>
        </div>
      )}

      {analyzed && !analyzing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Current vs Target</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid className="stroke-muted" />
                    <PolarAngleAxis dataKey="skill" className="text-xs" />
                    <PolarRadiusAxis domain={[0, 10]} className="text-xs" />
                    <Radar
                      dataKey="current"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      name="Current"
                    />
                    <Radar
                      dataKey="target"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.2}
                      name="Target"
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Skill Gaps</h3>
              <div className="space-y-4">
                {mockGaps.map((gap) => (
                  <div key={gap.skill}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{gap.skill}</span>
                      <span className="text-muted-foreground">
                        {gap.current}/10 -&gt; {gap.target}/10
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(gap.current / 10) * 100}%` }}
                      />
                      <div
                        className="h-full bg-orange-400"
                        style={{ width: `${((gap.target - Math.max(gap.current, 0)) / 10) * 100}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Gap: {gap.gap} levels · ~{gap.gap * 10} hours to close
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Ready to close the gap?</h3>
              <p className="text-sm text-muted-foreground">
                Generate a personalized learning roadmap based on your skill gaps.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
              <TrendingUp className="h-4 w-4" />
              Generate Learning Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
