import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { generateFeedback } from "@/lib/ai/interview-engine"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const session = await prisma.interviewSession.findUnique({
      where: { id: params.id },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json({ sessionId: session.id, status: "COMPLETED" }, { headers: getRateLimitHeaders(rateResult) })
    }

    const existingReport = await prisma.feedbackReport.findUnique({
      where: { sessionId: params.id },
    })

    if (!existingReport) {
      const questions = await prisma.interviewQuestion.findMany({
        where: { sessionId: params.id },
        include: {
          responses: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { sequenceNumber: "asc" },
      })

      const answeredQuestions = questions.filter(
        (q: { isAnswered: boolean; questionType: string | null; responses: { id: string; responseText: string | null }[] }) =>
          q.isAnswered && q.responses.length > 0 && q.questionType !== "FOLLOW_UP"
      )

      if (answeredQuestions.length > 0) {
        const qaPairs = answeredQuestions.map((q: { questionText: string; responses: { responseText: string | null }[] }) => ({
          question: q.questionText,
          answer: q.responses[q.responses.length - 1]?.responseText || "",
        }))

        const feedback = generateFeedback(qaPairs, session.interviewType)

        await prisma.feedbackReport.create({
          data: {
            sessionId: params.id,
            overallScore: feedback.overallScore || 0,
            dimensionScores: JSON.stringify(feedback.dimensionScores),
            strengths: JSON.stringify(feedback.strengths || []),
            weaknesses: JSON.stringify(feedback.weaknesses || []),
            summary: feedback.summary || "",
            generatedAt: new Date(),
          },
        })
      }
    }

    await prisma.interviewSession.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    })

    return NextResponse.json(
      { sessionId: session.id, status: "COMPLETED" },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
