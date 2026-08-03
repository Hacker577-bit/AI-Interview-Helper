"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Target,
  TrendingUp,
  BookOpen,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Zap,
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
import { Alert } from "@/components/ui/alert"

interface Gap {
  skill: string
  demandLevel: "HIGH" | "MEDIUM" | "LOW"
  currentProficiency: number
  targetProficiency: number
  learningHours: number
}

interface SkillGapResponse {
  currentSkills: string[]
  targetSkills: string[]
  gaps: Gap[]
  recommendations: string[]
}

const DEMAND_STYLES: Record<string, string> = {
  HIGH: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
}

export default function SkillGapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [targetRole, setTargetRole] = useState("Senior Software Engineer")
  const [analysis, setAnalysis] = useState<SkillGapResponse | null>(null)
  const [skills, setSkills] = useState<{ name: string; level: string | null; category: string | null; yearsExp: number | null }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/resume/list", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : { resumes: [] }))
      .then((data) => {
        const current = (data.resumes || []).find((r: { isCurrent: boolean }) => r.isCurrent)
        if (current) {
          return fetch(`/api/resume/${current.id}`)
            .then((res) => (res.ok ? res.json() : { resume: null }))
            .then((d) => {
              if (d.resume?.skills?.length) {
                setSkills(d.resume.skills)
              }
            })
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, skills }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to analyze skill gaps")
      }
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze skill gaps")
    } finally {
      setAnalyzing(false)
    }
  }, [targetRole, skills])

  const handleGenerateRoadmap = useCallback(async () => {
    if (!analysis) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, skills }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to generate learning roadmap")
      }
      await res.json()
      router.push("/dashboard/learning-path")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate learning roadmap")
    } finally {
      setGenerating(false)
    }
  }, [analysis, targetRole, skills, router])

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

  const radarData = (analysis?.gaps || []).map((g) => ({
    skill: g.skill,
    current: g.currentProficiency,
    target: g.targetProficiency,
  }))

  const totalHours = (analysis?.gaps || []).reduce((sum, g) => sum + g.learningHours, 0)
  const topGap = (analysis?.gaps || [])[0]

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-primary" />
            Skill Gap Analysis
          </h2>
          <p className="text-muted-foreground">
            Compare your current skills against your target role requirements with AI.
          </p>
        </div>
        {skills.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {skills.length} skills loaded from your resume
          </span>
        )}
      </div>

      {error && (
        <Alert variant="error" title="Something went wrong">
          {error}
        </Alert>
      )}

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
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-60"
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
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
              <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">AI is analyzing your skill gaps...</p>
          </div>
        </div>
      )}

      {analysis && !analyzing && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Current vs Target</h3>
              {radarData.length > 0 ? (
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
                        strokeWidth={2}
                        name="Current"
                      />
                      <Radar
                        dataKey="target"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.15}
                        strokeWidth={2}
                        name="Target"
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
                  No gaps identified - you are fully aligned with this role.
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Skill Gaps</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                  <Zap className="h-3 w-3" />
                  {totalHours}h to close
                </span>
              </div>
              {analysis.gaps.length > 0 ? (
                <div className="space-y-4">
                  {analysis.gaps.map((gap) => (
                    <div key={gap.skill}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                          {gap.skill}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DEMAND_STYLES[gap.demandLevel]}`}>
                            {gap.demandLevel}
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          {gap.currentProficiency}/10 -&gt; {gap.targetProficiency}/10
                        </span>
                      </div>
                      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${(gap.currentProficiency / 10) * 100}%` }}
                        />
                        <div
                          className="h-full bg-orange-400 transition-all duration-700"
                          style={{ width: `${((gap.targetProficiency - gap.currentProficiency) / 10) * 100}%` }}
                        />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Gap: {gap.targetProficiency - gap.currentProficiency} levels · ~{gap.learningHours} hours to close
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No significant gaps. Great job - you are ready for this role!
                </p>
              )}

              {topGap && (
                <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-900/20">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Top priority: {topGap.skill}
                  </p>
                  <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-300/80">
                    Highest demand, biggest gap. Start here to maximize your impact.
                  </p>
                </div>
              )}
            </div>
          </div>

          {analysis.recommendations.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">AI Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 rounded-xl border bg-gradient-to-r from-primary/10 via-card to-card p-6 text-center shadow-sm sm:flex-row sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">Ready to close the gap?</h3>
              <p className="text-sm text-muted-foreground">
                Generate a personalized AI learning roadmap based on your skill gaps.
              </p>
            </div>
            <button
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Generate Learning Roadmap
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!analysis && !analyzing && (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Target className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Enter a target role above and click{" "}
            <span className="font-semibold text-foreground">Analyze Skills</span> to get started.
          </p>
        </div>
      )}
    </div>
  )
}
