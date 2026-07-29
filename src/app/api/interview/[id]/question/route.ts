import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { generateFollowUp } from "@/lib/ai/interview-engine"
import { answerSubmitSchema } from "@/lib/validators"
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

    const nextQuestion = await prisma.interviewQuestion.findFirst({
      where: {
        sessionId: params.id,
        isAnswered: false,
      },
      orderBy: { sequenceNumber: "asc" },
      include: {
        responses: true,
      },
    })

    if (!nextQuestion) {
      return NextResponse.json({ question: null, isComplete: true }, { headers: getRateLimitHeaders(rateResult) })
    }

    return NextResponse.json(
      {
        question: nextQuestion,
        isComplete: false,
        totalQuestions: session.questionCount,
        answeredCount: await prisma.interviewQuestion.count({
          where: { sessionId: params.id, isAnswered: true },
        }),
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

    const body = await req.json()

    const parsed = answerSubmitSchema.safeParse({
      questionId: body.questionId || body.id,
      responseText: body.answer || body.responseText,
      responseTimeMs: body.responseTimeMs,
    })

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { questionId, responseText: answer, responseTimeMs } = parsed.data

    const session = await prisma.interviewSession.findUnique({
      where: { id: params.id },
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId },
    })

    if (!question || question.sessionId !== params.id) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const wordCount = answer.split(/\s+/).filter(Boolean).length

    await prisma.questionResponse.create({
      data: {
        questionId: question.id,
        responseText: answer,
        responseTimeMs: responseTimeMs || null,
        wordCount,
      },
    })

    await prisma.interviewQuestion.update({
      where: { id: question.id },
      data: { isAnswered: true },
    })

    const followUpText = generateFollowUp(question.questionText, answer)

    if (followUpText) {
      const maxSeq = await prisma.interviewQuestion.findFirst({
        where: { sessionId: params.id },
        orderBy: { sequenceNumber: "desc" },
        select: { sequenceNumber: true },
      })

      const newSeq = (maxSeq?.sequenceNumber || 0) + 1

      const followUp = await prisma.interviewQuestion.create({
        data: {
          sessionId: params.id,
          sequenceNumber: newSeq,
          questionText: followUpText,
          questionType: "FOLLOW_UP",
          category: "FOLLOW_UP",
          isAnswered: false,
        },
        include: { responses: true },
      })

      return NextResponse.json(
        {
          nextQuestion: followUp,
          isComplete: false,
          followUp: true,
        },
        { headers: getRateLimitHeaders(rateResult) }
      )
    }

    const remainingQuestion = await prisma.interviewQuestion.findFirst({
      where: {
        sessionId: params.id,
        isAnswered: false,
      },
      orderBy: { sequenceNumber: "asc" },
      include: { responses: true },
    })

    if (!remainingQuestion) {
      return NextResponse.json(
        {
          nextQuestion: null,
          isComplete: true,
        },
        { headers: getRateLimitHeaders(rateResult) }
      )
    }

    return NextResponse.json(
      {
        nextQuestion: remainingQuestion,
        isComplete: false,
      },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
