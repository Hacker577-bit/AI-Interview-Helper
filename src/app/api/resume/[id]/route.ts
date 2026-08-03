import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/api-helpers"

export async function GET(
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
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (resume.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parsedExperiences = resume.experiences.map(
      (exp: { highlights: string | null; [key: string]: unknown }) => ({
        ...exp,
        highlights: exp.highlights ? JSON.parse(exp.highlights) : null,
      })
    )

    const { experiences: _exp, ...restOfResume } = resume

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

export async function PATCH(
  req: Request,
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

    const body = await req.json()
    const { isCurrent } = body

    if (isCurrent === true) {
      await prisma.$transaction([
        prisma.resume.updateMany({
          where: { userId: user.id, isCurrent: true },
          data: { isCurrent: false },
        }),
        prisma.resume.update({
          where: { id: params.id },
          data: { isCurrent: true },
        }),
      ])
    }

    const updatedResume = await prisma.resume.findUnique({
      where: { id: params.id },
      include: {
        skills: true,
        experiences: true,
        educations: true,
      },
    })

    if (!updatedResume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
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

export async function DELETE(
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

    await prisma.resume.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
