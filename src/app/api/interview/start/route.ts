import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { generateQuestions } from "@/lib/ai/interview-engine"

const FREE_MONTHLY_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { planTier: true, interviewUsageMonth: true, interviewUsageReset: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (dbUser.planTier === "FREE") {
      const usageReset = dbUser.interviewUsageReset
        ? new Date(dbUser.interviewUsageReset)
        : null

      if (!usageReset || usageReset < monthStart) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            interviewUsageMonth: 0,
            interviewUsageReset: monthStart,
          },
        })
      } else {
        const currentUsage = dbUser.interviewUsageMonth
        if (currentUsage >= FREE_MONTHLY_LIMIT) {
          return NextResponse.json(
            {
              error: "Monthly interview limit reached",
              detail: `Free users can start ${FREE_MONTHLY_LIMIT} interviews per month.`,
              upgradeUrl: "/dashboard/settings?tab=billing",
              currentUsage,
              limit: FREE_MONTHLY_LIMIT,
            },
            { status: 429 }
          )
        }
      }
    }

    const body = await req.json()
    const {
      interviewType = "BEHAVIORAL",
      difficulty = "MID",
      questionCount = 10,
      mode = "TEXT",
      resumeId,
      jdText,
    } = body

    if (!["BEHAVIORAL", "TECHNICAL", "CASE_STUDY", "MIXED"].includes(interviewType)) {
      return NextResponse.json({ error: "Invalid interview type" }, { status: 400 })
    }

    if (!["ENTRY", "MID", "SENIOR", "STAFF"].includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty level" }, { status: 400 })
    }

    if (questionCount < 1 || questionCount > 30) {
      return NextResponse.json({ error: "Question count must be between 1 and 30" }, { status: 400 })
    }

    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        resumeId: resumeId || null,
        jdText: jdText || null,
        interviewType,
        difficulty,
        mode,
        questionCount,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { interviewUsageMonth: { increment: 1 } },
    })

    const questions = generateQuestions(interviewType, difficulty, questionCount)

    await prisma.interviewQuestion.createMany({
      data: questions.map((q) => ({
        sessionId: session.id,
        sequenceNumber: q.sequenceNumber,
        questionText: q.questionText,
        questionType: q.questionType || interviewType,
        category: q.category || interviewType,
        isAnswered: false,
      })),
    })

    const sessionWithQuestions = await prisma.interviewSession.findUnique({
      where: { id: session.id },
      include: {
        questions: {
          orderBy: { sequenceNumber: "asc" },
          include: {
            responses: true,
          },
        },
      },
    })

    return NextResponse.json({ session: sessionWithQuestions }, { status: 201 })
  } catch (error) {
    console.error("Interview start error:", error)
    return NextResponse.json({ error: "Failed to create interview session" }, { status: 500 })
  }
}
