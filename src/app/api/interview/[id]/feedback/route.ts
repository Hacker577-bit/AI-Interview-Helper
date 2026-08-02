import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { generateFeedback, generateFeedbackWithAI } from "@/lib/ai/interview-engine"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function GET(
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

    if (session.status !== "COMPLETED") {
      return NextResponse.json({ error: "Interview is not completed yet" }, { status: 400 })
    }

    const report = await prisma.feedbackReport.findUnique({
      where: { sessionId: params.id },
    })

    if (!report) {
      return NextResponse.json({ error: "No feedback report found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        report: {
          id: report.id,
          sessionId: report.sessionId,
          overallScore: report.overallScore,
          dimensionScores: report.dimensionScores ? JSON.parse(report.dimensionScores) : null,
          strengths: report.strengths ? JSON.parse(report.strengths) : null,
          weaknesses: report.weaknesses ? JSON.parse(report.weaknesses) : null,
          summary: report.summary,
          generatedAt: report.generatedAt.toISOString(),
        },
      },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

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

    const existingReport = await prisma.feedbackReport.findUnique({
      where: { sessionId: params.id },
    })

    if (existingReport) {
      return NextResponse.json(
        {
          report: {
            id: existingReport.id,
            sessionId: existingReport.sessionId,
            overallScore: existingReport.overallScore,
            dimensionScores: existingReport.dimensionScores ? JSON.parse(existingReport.dimensionScores) : null,
            strengths: existingReport.strengths ? JSON.parse(existingReport.strengths) : null,
            weaknesses: existingReport.weaknesses ? JSON.parse(existingReport.weaknesses) : null,
            summary: existingReport.summary,
            generatedAt: existingReport.generatedAt.toISOString(),
          },
        },
        { headers: getRateLimitHeaders(rateResult) }
      )
    }

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
      (q: { isAnswered: boolean; questionType: string | null; responses: unknown[] }) =>
        q.isAnswered && q.responses.length > 0 && q.questionType !== "FOLLOW_UP"
    )

    const qaPairs = answeredQuestions.map((q: { questionText: string; responses: { responseText: string | null }[] }) => ({
      question: q.questionText,
      answer: q.responses[q.responses.length - 1]?.responseText || "",
    }))

    const feedback = await generateFeedbackWithAI(
      qaPairs,
      session.interviewType,
      {
        difficulty: session.difficulty,
        jdText: session.jdText || undefined,
      }
    ).catch(() => generateFeedback(qaPairs, session.interviewType))

    const report = await prisma.feedbackReport.create({
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

    await prisma.interviewSession.update({
      where: { id: params.id },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    })

    return NextResponse.json(
      {
        report: {
          id: report.id,
          sessionId: report.sessionId,
          overallScore: report.overallScore,
          dimensionScores: feedback.dimensionScores,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          summary: report.summary,
          generatedAt: report.generatedAt.toISOString(),
        },
      },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
