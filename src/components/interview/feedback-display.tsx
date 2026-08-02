"use client"

import { cn } from "@/lib/utils"
import { ThumbsUp, Lightbulb, Sparkles, Trophy } from "lucide-react"
import { FeedbackReport, DimensionScores } from "@/types"

interface FeedbackDisplayProps {
  report: FeedbackReport
}

function ScoreCircle({ score }: { score: number | null }) {
  const val = score ?? 0
  const color =
    val >= 8 ? "text-emerald-500" : val >= 6 ? "text-amber-500" : "text-red-500"
  const bgColor =
    val >= 8
      ? "stroke-emerald-500"
      : val >= 6
        ? "stroke-amber-500"
        : "stroke-red-500"
  const trackColor = "stroke-muted"

  const circumference = 2 * Math.PI * 48
  const offset = circumference - (val / 10) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        <div
          className={cn(
            "absolute inset-0 rounded-full blur-2xl opacity-20",
            val >= 8 ? "bg-emerald-500" : val >= 6 ? "bg-amber-500" : "bg-red-500"
          )}
        />
        <svg className="relative h-full w-full -rotate-90" viewBox="0 0 112 112">
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            strokeWidth="8"
            className={trackColor}
          />
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={bgColor}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: offset,
              transition: "stroke-dashoffset 1s ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-4xl font-bold", color)}>
            {val.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">/ 10</span>
        </div>
      </div>
    </div>
  )
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 10) * 100
  const color =
    pct >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : pct >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}/10</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function FeedbackDisplay({ report }: FeedbackDisplayProps) {
  const { overallScore, dimensionScores, strengths, weaknesses, summary } = report

  const verdict =
    overallScore && overallScore >= 8
      ? { label: "Excellent", emoji: "bg-emerald-500", sub: "You're ready for real interviews" }
      : overallScore && overallScore >= 6
        ? { label: "Good", emoji: "bg-amber-500", sub: "Solid foundation, keep refining" }
        : { label: "Needs Improvement", emoji: "bg-red-500", sub: "Focus on the areas below" }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-xl border bg-card p-8 shadow-card">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold">Interview Score</h2>
          <ScoreCircle score={overallScore || null} />
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-white shadow-lg",
              verdict.emoji
            )}
          >
            <Trophy className="h-4 w-4" />
            {verdict.label}
          </span>
          <p className="mt-1 text-sm text-muted-foreground">{verdict.sub}</p>
        </div>
      </div>

      {dimensionScores && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Dimension Scores
          </h3>
          <div className="space-y-4">
            <DimensionBar label="Clarity" value={dimensionScores.clarity} />
            <DimensionBar label="Relevance" value={dimensionScores.relevance} />
            <DimensionBar label="Depth" value={dimensionScores.depth} />
            <DimensionBar label="Impact" value={dimensionScores.impact} />
            <DimensionBar label="Delivery" value={dimensionScores.delivery} />
          </div>
        </div>
      )}

      {strengths && strengths.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            <ThumbsUp className="h-4 w-4" />
            Strengths
          </h3>
          <ul className="space-y-2.5">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                <span className="leading-relaxed text-muted-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses && weaknesses.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            <Lightbulb className="h-4 w-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2.5">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-1.5 flex h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                <span className="leading-relaxed text-muted-foreground">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-indigo-500/5 p-6 shadow-card">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            AI Assessment
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      )}
    </div>
  )
}

export default FeedbackDisplay
