import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { parseResume, parseResumeWithAI } from "@/lib/ai/resume-parser"
import { analyzeATS, analyzeATSWithAI } from "@/lib/ai/ats-analyzer"
import { resumeTextSchema } from "@/lib/validators"
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

    const parsed = resumeTextSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { resumeText } = parsed.data

    const parsedResume = await parseResumeWithAI(resumeText)
    const skills = parsedResume.skills.length > 0 ? parsedResume.skills : parseResume(resumeText).skills
    const atsAnalysis = await analyzeATSWithAI(resumeText, skills, body.jobDescription)

    return NextResponse.json(
      {
        skills: parsedResume.skills,
        experiences: parsedResume.experiences,
        educations: parsedResume.educations,
        summary: parsedResume.summary,
        atsAnalysis,
      },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
