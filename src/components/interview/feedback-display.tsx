"use client"

import { cn } from "@/lib/utils"
import { ThumbsUp, Lightbulb, Sparkles } from "lucide-react"
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
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 112 112">
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
          <span className={cn("text-3xl font-bold", color)}>
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
    pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{value}/10</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-8 shadow-sm">
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-bold">Interview Score</h2>
          <ScoreCircle score={overallScore || null} />
          <p className="mt-2 text-sm text-muted-foreground">
            {overallScore && overallScore >= 8
              ? "Excellent"
              : overallScore && overallScore >= 6
                ? "Good"
                : "Needs Improvement"}
          </p>
        </div>
      </div>

      {dimensionScores && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
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
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            <ThumbsUp className="h-4 w-4" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {weaknesses && weaknesses.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-600">
            <Lightbulb className="h-4 w-4" />
            Areas to Improve
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            <Sparkles className="h-4 w-4" />
            AI Summary
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
        </div>
      )}
    </div>
  )
}

export default FeedbackDisplay
