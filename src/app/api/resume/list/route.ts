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
        fileName: true,
        isCurrent: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ resumes })
  } catch (error) {
    return handleApiError(error)
  }
}
