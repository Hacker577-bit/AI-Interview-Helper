import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
      select: { userId: true, fileData: true, fileName: true },
    })

    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    if (resume.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (!resume.fileData) return NextResponse.json({ error: "File not found" }, { status: 404 })

    const ext = resume.fileName.split(".").pop()?.toLowerCase()
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : ext === "txt"
            ? "text/plain"
            : "application/octet-stream"

    return new NextResponse(new Uint8Array(resume.fileData), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`,
        "Cache-Control": "private, max-age=3600",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self'",
      },
    })
  } catch (error) {
    console.error("Resume file fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
  }
}
