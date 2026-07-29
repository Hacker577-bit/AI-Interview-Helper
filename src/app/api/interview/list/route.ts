import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"

  const rateResult = rateLimiters.api(ip)
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(rateResult) }
    )
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        questions: {
          select: {
            id: true,
            isAnswered: true,
          },
        },
        feedbackReport: {
          select: {
            id: true,
            overallScore: true,
          },
        },
      },
    })

    const formatted = sessions.map((session: { id: string; interviewType: string; difficulty: string; mode: string; status: string; questionCount: number; startedAt: Date | null; endedAt: Date | null; createdAt: Date; feedbackReport: { overallScore: number | null } | null; questions: { isAnswered: boolean }[] }) => ({
      id: session.id,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      mode: session.mode,
      status: session.status,
      questionCount: session.questionCount,
      answeredCount: session.questions.filter((q: { isAnswered: boolean }) => q.isAnswered).length,
      overallScore: session.feedbackReport?.overallScore || null,
      startedAt: session.startedAt?.toISOString() || null,
      endedAt: session.endedAt?.toISOString() || null,
      createdAt: session.createdAt.toISOString(),
    }))

    return NextResponse.json({ sessions: formatted }, { headers: getRateLimitHeaders(rateResult) })
  } catch (error) {
    return handleApiError(error)
  }
}
