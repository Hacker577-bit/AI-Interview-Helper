"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Clock, Send, Loader2, AlertCircle, CheckCircle2, Flag, Sparkles, Keyboard, Mic } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { PageLoader } from "@/components/ui/loading-spinner"
import { Alert } from "@/components/ui/alert"
import { VoiceControls } from "@/components/interview/voice-controls"
import { useVoice } from "@/hooks/use-voice"

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
  const [mode, setMode] = useState<"TEXT" | "VOICE" | "VIDEO">("TEXT")
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [elapsed, setElapsed] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const answerSourceRef = useRef<"text" | "voice">("text")

  const voice = useVoice({
    onTranscriptChange: useCallback((text: string) => {
      answerSourceRef.current = "voice"
      setAnswer(text)
    }, []),
  })
  const voiceRef = useRef(voice)
  voiceRef.current = voice

  const isVoiceMode = mode === "VOICE"

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
      if (data.mode) setMode(data.mode)
      if (data.isComplete) {
        voiceRef.current.stopAll()
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

  useEffect(() => {
    if (!currentQuestion || !isVoiceMode) return

    voiceRef.current.stopAll()
    voiceRef.current.resetTranscript()
    answerSourceRef.current = "text"
    setAnswer("")

    const timer = setTimeout(() => {
      voiceRef.current.speak(currentQuestion.questionText)
    }, 350)

    return () => clearTimeout(timer)
  }, [currentQuestion, isVoiceMode])

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return

    voice.cancelListening()
    setSubmitting(true)
    try {
      const responseTimeMs = Date.now() - startTime
      const source = answerSourceRef.current

      const res = await fetch(`/api/interview/${sessionId}/question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer.trim(),
          responseTimeMs,
          source,
          transcribedText: source === "voice" ? answer.trim() : undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit answer")
      }

      const data = await res.json()

      if (data.isComplete) {
        voice.stopAll()
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

      answerSourceRef.current = "text"
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
      router.push(`/dashboard/interviews/${sessionId}/report`)
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
            onClick={() => router.push("/dashboard/interviews")}
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
        <div className="relative overflow-hidden rounded-xl border bg-card p-8 text-center shadow-card">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <div className="relative">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-emerald-400/30" />
              <CheckCircle2 className="relative h-16 w-16 text-emerald-500" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">Interview Complete!</h2>
            <p className="mt-2 text-muted-foreground">
              You answered {answeredCount} question{answeredCount !== 1 ? "s" : ""}. Ready to see your AI feedback?
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg border px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                Back to Dashboard
              </button>
              <button
                onClick={handleFinish}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
              >
                <Sparkles className="h-4 w-4" />
                View AI Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 animate-in fade-in duration-300">
      <div className="rounded-xl border bg-card p-4 shadow-card">
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
        <div className="rounded-xl border bg-card p-6 shadow-card animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Q{currentQuestion.sequenceNumber}
            </span>
            {currentQuestion.questionType === "FOLLOW_UP" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
                <Flag className="h-3 w-3" />
                Follow-up
              </span>
            )}
            {currentQuestion.category && currentQuestion.questionType !== "FOLLOW_UP" && (
              <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {currentQuestion.category.replace(/_/g, " ")}
              </span>
            )}
            {isVoiceMode && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                <Mic className="h-3 w-3" />
                Voice mode
              </span>
            )}
          </div>

          <h3 className="mt-4 text-lg font-semibold leading-relaxed">
            {currentQuestion.questionText}
          </h3>
        </div>
      )}

      <div className="rounded-xl border bg-card p-6 shadow-card">
        {isVoiceMode && (
          <div className="mb-4 space-y-3">
            <VoiceControls
              isSpeaking={voice.isSpeaking}
              isListening={voice.isListening}
              ttsSupported={voice.ttsSupported}
              sttSupported={voice.sttSupported}
              interimTranscript={voice.interimTranscript}
              error={voice.error}
              disabled={submitting}
              onSpeakQuestion={() => currentQuestion && voice.speak(currentQuestion.questionText)}
              onStopSpeaking={voice.stopSpeaking}
              onStartListening={voice.startListening}
              onStopListening={voice.stopListening}
            />
            {!voice.ttsSupported && !voice.sttSupported && (
              <Alert variant="warning" title="Voice features unavailable">
                Your browser does not support voice features. You can still complete this interview by typing your
                answers below.
              </Alert>
            )}
          </div>
        )}

        <textarea
          ref={inputRef}
          value={answer}
          onChange={(e) => {
            answerSourceRef.current = "text"
            setAnswer(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          placeholder={isVoiceMode ? "Your spoken answer appears here. Review and edit if needed..." : "Type your answer here... Be specific, use examples, and quantify results where possible."}
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
                ? "bg-primary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
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

        <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-muted-foreground">
          <Keyboard className="h-3 w-3" />
          Press Ctrl+Enter to submit
        </p>
      </div>
    </div>
  )
}
