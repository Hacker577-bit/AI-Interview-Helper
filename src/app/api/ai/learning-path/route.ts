import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { analyzeSkillGap, generateLearningPathWithAI, generateLearningPathRuleBased } from "@/lib/ai/skill-gap-engine"
import { skillGapSchema } from "@/lib/validators"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const learningPaths = await prisma.learningPath.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 1,
    })

    if (!learningPaths[0]) {
      return NextResponse.json({ learningPath: null })
    }

    const lp = learningPaths[0]
    const items = lp.items ? JSON.parse(lp.items) : []

    return NextResponse.json({
      learningPath: {
        id: lp.id,
        title: lp.title,
        goalRole: lp.goalRole,
        progress: lp.progress,
        items,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const rateResult = rateLimiters.ai(ip)
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

    const body = await request.json()

    const parsed = skillGapSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { targetRole } = parsed.data

    const validatedSkills = (parsed.data.skills || []).map((s, i) => ({
      id: s.name || `skill-${i}`,
      name: s.name,
      category: s.category,
      level: s.level,
      yearsExp: s.yearsExp || null,
    }))

    const analysis = analyzeSkillGap(validatedSkills, targetRole)
    const learningPath = await generateLearningPathWithAI(validatedSkills, targetRole, analysis)

    const saved = await prisma.learningPath.create({
      data: {
        userId: user.id,
        title: learningPath.title,
        goalRole: learningPath.goalRole,
        items: JSON.stringify(learningPath.items),
        progress: 0,
      },
    })

    return NextResponse.json(
      { learningPath: { ...learningPath, id: saved.id } },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}

