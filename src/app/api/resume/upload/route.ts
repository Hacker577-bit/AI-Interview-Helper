import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { extractTextFromFile } from "@/lib/pdf-parser"
import { parseResumeWithAI, parseResume } from "@/lib/ai/resume-parser"

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PDF, DOCX, and TXT files are allowed",
        },
        { status: 400 }
      )
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const extractedText = await extractTextFromFile(file)

    const parsedText = extractedText.slice(0, 50000)

    await prisma.resume.updateMany({
      where: { userId: user.id, isCurrent: true },
      data: { isCurrent: false },
    })

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileData: fileBuffer,
        parsedText,
        isCurrent: true,
      },
      select: {
        id: true,
        userId: true,
        fileUrl: true,
        fileName: true,
        parsedText: true,
        isCurrent: true,
        createdAt: true,
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    const parsed = await parseResumeWithAI(parsedText)
    const fallback = parseResume(parsedText)

    const skills = parsed.skills.length > 0 ? parsed.skills : fallback.skills
    const experiences = parsed.experiences.length > 0 ? parsed.experiences : fallback.experiences
    const educations = parsed.educations.length > 0 ? parsed.educations : fallback.educations

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

    await prisma.resume.update({
      where: { id: resume.id },
      data: { fileUrl: `/api/resume/${resume.id}/file` },
    })

    const updatedResume = await prisma.resume.findUnique({
      where: { id: resume.id },
      select: {
        id: true,
        userId: true,
        fileUrl: true,
        fileName: true,
        parsedText: true,
        isCurrent: true,
        createdAt: true,
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    if (!updatedResume) {
      return NextResponse.json({ error: "Failed to retrieve uploaded resume" }, { status: 500 })
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
      extractionNote:
        file.type === "application/pdf"
          ? "Basic PDF text extraction performed. Scanned/image PDFs may have limited results."
          : undefined,
    }, { status: 201 })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 })
  }
}
