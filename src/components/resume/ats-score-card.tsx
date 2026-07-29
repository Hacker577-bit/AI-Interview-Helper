"use client"

import { useState } from "react"
import {
  TrendingUp,
  Search,
  Layout,
  FileText,
  AlertTriangle,
  Lightbulb,
  Zap,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ATSAnalysis } from "@/types"

interface ATSScoreCardProps {
  analysis: ATSAnalysis
  className?: string
}

function RadialScore({ score, size = 120, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: "text-green-500", track: "text-green-100 dark:text-green-900" }
    if (s >= 60) return { stroke: "text-amber-500", track: "text-amber-100 dark:text-amber-900" }
    return { stroke: "text-red-500", track: "text-red-100 dark:text-red-900" }
  }

  const colors = getColor(score)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={colors.track}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colors.stroke}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  )
}

function SubScoreBar({
  label,
  score,
  icon: Icon,
}: {
  label: string
  score: number
  icon: React.ElementType
}) {
  const getColor = (s: number) => {
    if (s >= 80) return "bg-green-500"
    if (s >= 60) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{score}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor(score))}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function ATSScoreCard({ analysis, className }: ATSScoreCardProps) {
  const [showMore, setShowMore] = useState(false)

  const getLevelLabel = (score: number): string => {
    if (score >= 80) return "Strong Match"
    if (score >= 60) return "Moderate Match"
    return "Needs Improvement"
  }

  const getLevelColor = (score: number): string => {
    if (score >= 80) return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950"
    if (score >= 60) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950"
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950"
  }

  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-6", className)}>
      <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-semibold">ATS Score</h3>
        <RadialScore score={analysis.overallScore} />
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            getLevelColor(analysis.overallScore)
          )}
        >
          {getLevelLabel(analysis.overallScore)}
        </span>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Score Breakdown
        </h4>
        <SubScoreBar
          label="Keyword Match"
          score={analysis.keywordMatch}
          icon={Search}
        />
        <SubScoreBar
          label="Format Score"
          score={analysis.formatScore}
          icon={Layout}
        />
        <SubScoreBar
          label="Content Score"
          score={analysis.contentScore}
          icon={FileText}
        />
      </div>

      {analysis.missingKeywords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h4 className="text-sm font-semibold">Missing Keywords</h4>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {analysis.missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold">Suggestions</h4>
        </div>

        <ul className="space-y-2">
          {(showMore ? analysis.suggestions : analysis.suggestions.slice(0, 3)).map(
            (suggestion, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
              >
                <span className="mt-0.5 shrink-0 text-xs font-bold text-primary">
                  {i + 1}.
                </span>
                {suggestion}
              </li>
            )
          )}
        </ul>

        {analysis.suggestions.length > 3 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {showMore ? "Show less" : `Show all ${analysis.suggestions.length} suggestions`}
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                showMore && "rotate-90"
              )}
            />
          </button>
        )}
      </div>

      <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
        <Zap className="h-4 w-4" />
        Optimize Resume
      </button>
    </div>
  )
}
