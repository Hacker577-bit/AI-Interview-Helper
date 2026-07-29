"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Clock, Send, Loader2, AlertCircle, CheckCircle2, Flag } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Alert } from "@/components/ui/alert"

interface Question {
  id: string
  sessionId: string
  sequenceNumber: number
  questionText: string
  questionType: string | null
  category: string | null
  isAnswered: boolean
  responses: {
    id: string
    responseText: string | null
    responseTimeMs: number | null
    wordCount: number | null
  }[]
}

export default function InterviewSessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const wordCount = answer.split(/\s+/).filter(Boolean).length
  const charCount = answer.length

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    timerRef.current = interval
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTime])

  const fetchNextQuestion = useCallback(async () => {
    try {
      const res = await fetch(`/api/interview/${sessionId}/question`)
      if (!res.ok) {
        if (res.status === 404) {
          setError("Interview session not found")
          return
        }
        throw new Error("Failed to fetch question")
      }
      const data = await res.json()
      if (data.isComplete) {
        setIsComplete(true)
        setCurrentQuestion(null)
      } else {
        setCurrentQuestion(data.question)
        setIsComplete(false)
      }
      if (data.totalQuestions) setTotalQuestions(data.totalQuestions)
      if (typeof data.answeredCount === "number") setAnsweredCount(data.answeredCount)
    } catch (err) {
      setError("Failed to load interview question")
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchNextQuestion()
  }, [fetchNextQuestion])

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return

    setSubmitting(true)
    try {
      const responseTimeMs = Date.now() - startTime

      const res = await fetch(`/api/interview/${sessionId}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer.trim(),
          responseTimeMs,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit answer")
      }

      const data = await res.json()

      if (data.isComplete) {
        setIsComplete(true)
        setCurrentQuestion(null)
        setAnsweredCount((prev) => prev + 1)
        toast.success("All questions answered!")
      } else if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion)
        setAnsweredCount((prev) => prev + 1)
        if (data.followUp) {
          toast.info("Follow-up question based on your answer")
        }
      }

      setAnswer("")
      setStartTime(Date.now())

      if (inputRef.current) {
        inputRef.current.focus()
      }
    } catch {
      toast.error("Failed to submit answer")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = async () => {
    try {
      const res = await fetch(`/api/interview/${sessionId}/end`, {
        method: "POST",
      })

      if (!res.ok) {
        throw new Error("Failed to end interview")
      }

      toast.success("Interview completed!")
      router.push(`/interviews/${sessionId}/report`)
    } catch {
      toast.error("Failed to complete interview")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  if (loading) {
    return <PageLoader text="Loading interview..." />
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl py-12 animate-in fade-in duration-300">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive/60" />
          <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/interviews")}
            className="mt-6 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Interviews
          </button>
        </div>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="mx-auto max-w-2xl py-12 animate-in fade-in zoom-in-95 duration-300">
        <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Interview Complete!</h2>
          <p className="mt-2 text-muted-foreground">
            You answered {answeredCount} question{answeredCount !== 1 ? "s" : ""}. Ready to see your feedback?
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/interviews")}
              className="rounded-lg border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleFinish}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Feedback
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 animate-in fade-in duration-300">
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">{formatTime(elapsed)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">
              {answeredCount} / {totalQuestions}
            </span>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <div className="rounded-xl border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-right-2 duration-300">
          {currentQuestion.questionType === "FOLLOW_UP" && (
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
              <Flag className="h-3 w-3" />
              Follow-up
            </div>
          )}

          <div className="mb-1 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Q{currentQuestion.sequenceNumber}
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-relaxed">
            {currentQuestion.questionText}
          </h3>

          {currentQuestion.category && (
            <span className="mt-2 inline-block text-xs text-muted-foreground">
              {currentQuestion.category.replace(/_/g, " ")}
            </span>
          )}
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <textarea
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer here... Use Ctrl+Enter to submit."
          rows={6}
          className="w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={submitting}
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{charCount} characters</span>
            <span className="h-3 w-px bg-border" />
            <span>{wordCount} words</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !answer.trim()}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all",
              answer.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Answer
              </>
            )}
          </button>
        </div>

        <p className="mt-2 text-[11px] text-muted-foreground">
          Press Ctrl+Enter to submit
        </p>
      </div>
    </div>
  )
}
