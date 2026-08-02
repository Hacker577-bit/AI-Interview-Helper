import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { parseResumeWithAI, parseResume } from "@/lib/ai/resume-parser"
import { handleApiError } from "@/lib/api-helpers"

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const resumeText = resume.parsedText || ""

    const parsed = await parseResumeWithAI(resumeText)
    const fallback = parseResume(resumeText)

    const skills = parsed.skills.length > 0 ? parsed.skills : fallback.skills
    const experiences = parsed.experiences.length > 0 ? parsed.experiences : fallback.experiences
    const educations = parsed.educations.length > 0 ? parsed.educations : fallback.educations

    await prisma.parsedSkill.deleteMany({ where: { resumeId: resume.id } })
    await prisma.parsedExperience.deleteMany({ where: { resumeId: resume.id } })
    await prisma.parsedEducation.deleteMany({ where: { resumeId: resume.id } })

    await prisma.parsedSkill.createMany({
      data: skills.map((skill) => ({
        resumeId: resume.id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        yearsExp: skill.yearsExp,
      })),
    })

    await prisma.parsedExperience.createMany({
      data: experiences.map((exp) => ({
        resumeId: resume.id,
        company: exp.company,
        title: exp.title,
        startDate: exp.startDate ? new Date(exp.startDate) : null,
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        description: exp.description,
        highlights: JSON.stringify(exp.highlights || []),
      })),
    })

    await prisma.parsedEducation.createMany({
      data: educations.map((edu) => ({
        resumeId: resume.id,
        school: edu.school,
        degree: edu.degree,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
      })),
    })

    const updatedResume = await prisma.resume.findUnique({
      where: { id: resume.id },
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    if (!updatedResume) {
      return NextResponse.json({ error: "Failed to retrieve updated resume" }, { status: 500 })
    }

    const parsedExperiences = updatedResume.experiences.map(
      (exp: { highlights: string | null; [key: string]: unknown }) => ({
        ...exp,
        highlights: exp.highlights ? JSON.parse(exp.highlights) : null,
      })
    )

    const { experiences: _exp, ...restOfResume } = updatedResume

    return NextResponse.json({
      resume: {
        ...restOfResume,
        experiences: parsedExperiences,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

