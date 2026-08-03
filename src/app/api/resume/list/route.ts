import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        fileUrl: true,
        fileName: true,
        parsedText: true,
        isCurrent: true,
        createdAt: true,
        skills: true,
        experiences: true,
        educations: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const resumesWithParsed = resumes.map((resume) => {
      const { experiences: rawExperiences, ...rest } = resume
      return {
        ...rest,
        experiences: rawExperiences.map((exp) => ({
          ...exp,
          highlights: exp.highlights ? JSON.parse(exp.highlights) : null,
        })),
      }
    })

    return NextResponse.json({ resumes: resumesWithParsed })
  } catch (error) {
    return handleApiError(error)
  }
}
