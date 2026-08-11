import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { checkInterviewQuota, incrementInterviewUsage } from "@/lib/billing"
import { generateQuestions, generateQuestionsWithAI } from "@/lib/ai/interview-engine"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const quota = await checkInterviewQuota(user.id)
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.reason || "Monthly interview limit reached",
          detail: quota.reason || "You have used all interviews for this billing period.",
          upgradeUrl: "/dashboard/settings?tab=billing",
        },
        { status: 429 }
      )
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

    // Resolve the resume to use: prefer explicitly-provided resumeId, otherwise
    // fall back to the user's current resume so questions are always tailored.
    let resolvedResumeId: string | null = resumeId || null
    let resumeSkills: string[] | undefined

    if (resolvedResumeId) {
      // Explicit resumeId supplied – verify ownership and fetch skills
      const resume = await prisma.resume.findUnique({
        where: { id: resolvedResumeId, userId: user.id },
        include: { skills: true },
      })
      if (resume) {
        resumeSkills = resume.skills.map((s) => s.name).filter(Boolean)
      } else {
        // Provided id not found / not owned – clear it so we don't store a bad FK
        resolvedResumeId = null
      }
    } else {
      // No resumeId provided – auto-attach the user's active resume
      const currentResume = await prisma.resume.findFirst({
        where: { userId: user.id, isCurrent: true },
        include: { skills: true },
      })
      if (currentResume) {
        resolvedResumeId = currentResume.id
        resumeSkills = currentResume.skills.map((s) => s.name).filter(Boolean)
      }
    }

    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        resumeId: resolvedResumeId,
        jdText: jdText || null,
        interviewType,
        difficulty,
        mode,
        questionCount,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    })

    await incrementInterviewUsage(user.id)

    const aiQuestions = await generateQuestionsWithAI(interviewType, difficulty, questionCount, resumeSkills, jdText)
    const questions = aiQuestions.length > 0 ? aiQuestions : generateQuestions(interviewType, difficulty, questionCount)

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
