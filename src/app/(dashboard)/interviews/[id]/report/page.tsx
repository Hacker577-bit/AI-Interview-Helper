"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, AlertCircle, RotateCcw, Home, FileText } from "lucide-react"
import FeedbackDisplay from "@/components/interview/feedback-display"
import { FeedbackReport } from "@/types"
import { PageLoader } from "@/components/ui/loading-spinner"

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<FeedbackReport | null>(null)
  const [generatingText, setGeneratingText] = useState("Generating your feedback report...")

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/feedback`)
        if (!res.ok) {
          if (res.status === 400) {
            const data = await res.json()
            if (data.error?.includes("not completed")) {
              setGeneratingText("Analyzing your responses with AI...")
              const genRes = await fetch(`/api/interview/${sessionId}/feedback`, {
                method: "POST",
              })
              if (genRes.ok) {
                const genData = await genRes.json()
                setReport(genData.report)
                return
              }
            }
          }
          throw new Error("Failed to fetch report")
        }
        const data = await res.json()
        setReport(data.report)
      } catch {
        setError("Failed to load feedback report")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center animate-in fade-in duration-300">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full bg-primary/20" />
          </div>
          <p className="text-base font-medium text-muted-foreground">{generatingText}</p>
          <p className="text-sm text-muted-foreground/60">This may take a few moments</p>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-2xl py-12 animate-in fade-in duration-300">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive/60" />
          <h3 className="mt-4 text-lg font-semibold">Could not load report</h3>
          <p className="mt-2 text-sm text-muted-foreground">{error || "No feedback data available"}</p>
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

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <FeedbackDisplay report={report} />

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => router.push("/interviews")}
          className="inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </button>
        <button
          onClick={() => router.push("/interviews")}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow"
        >
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </button>
      </div>
    </div>
  )
}
