import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { analyzeJobDescription, analyzeJobDescriptionWithAI } from "@/lib/ai/jd-analyzer"
import { jdAnalysisSchema } from "@/lib/validators"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

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

    const parsed = jdAnalysisSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { jdText, skills } = parsed.data

    const validatedSkills = (skills || []).map((s, i) => ({
      id: s.name || `skill-${i}`,
      name: s.name,
      category: s.category,
      level: s.level,
      yearsExp: null as number | null,
    }))

    const analysis = await analyzeJobDescriptionWithAI(jdText, validatedSkills)

    return NextResponse.json(analysis, { headers: getRateLimitHeaders(rateResult) })
  } catch (error) {
    return handleApiError(error)
  }
}
