import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/api-helpers"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lp = await prisma.learningPath.findUnique({ where: { id: params.id } })
    if (!lp) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 })
    }
    if (lp.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const items = Array.isArray(body.items) ? body.items : undefined
    const progress = typeof body.progress === "number" ? body.progress : undefined

    const updated = await prisma.learningPath.update({
      where: { id: params.id },
      data: {
        ...(items ? { items: JSON.stringify(items) } : {}),
        ...(progress !== undefined ? { progress } : {}),
      },
    })

    return NextResponse.json({
      learningPath: {
        id: updated.id,
        title: updated.title,
        goalRole: updated.goalRole,
        progress: updated.progress,
        items: updated.items ? JSON.parse(updated.items) : [],
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
