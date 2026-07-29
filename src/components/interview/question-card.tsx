"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface QuestionCardProps {
  sequenceNumber: number
  questionText: string
  questionType?: string | null
  category?: string | null
  isAnswered?: boolean
  answerText?: string | null
  isActive?: boolean
}

export function QuestionCard({
  sequenceNumber,
  questionText,
  questionType,
  category,
  isAnswered = false,
  answerText,
  isActive = false,
}: QuestionCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-all",
        isActive
          ? "border-primary/40 bg-primary/5 shadow-sm"
          : isAnswered
            ? "border-transparent bg-muted/40"
            : "bg-card"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
              isAnswered
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : isActive
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {isAnswered ? <CheckCircle2 className="h-3.5 w-3.5" /> : sequenceNumber}
          </span>
          {questionType && questionType !== "FOLLOW_UP" && (
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {questionType.replace(/_/g, " ")}
            </span>
          )}
          {questionType === "FOLLOW_UP" && (
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-600">
              Follow-up
            </span>
          )}
        </div>
        {category && (
          <span className="text-[11px] text-muted-foreground">
            {category.replace(/_/g, " ")}
          </span>
        )}
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed",
          isAnswered && !isActive ? "text-muted-foreground" : "text-foreground"
        )}
      >
        {questionText}
      </p>

      {answerText && isAnswered && (
        <div className="mt-3 rounded-lg border border-dashed bg-background/50 p-3">
          <p className="text-xs text-muted-foreground">
            Your answer:
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {answerText.length > 200 ? answerText.slice(0, 200) + "..." : answerText}
          </p>
        </div>
      )}
    </div>
  )
}

export default QuestionCard
