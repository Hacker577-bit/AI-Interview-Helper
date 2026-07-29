import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { saveFile } from "@/lib/storage"
import { extractTextFromFile } from "@/lib/pdf-parser"

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

    const [extractedText, { url, filepath: _filepath }] = await Promise.all([
      extractTextFromFile(file),
      saveFile(file, "resume"),
    ])

    const parsedText = extractedText.slice(0, 50000)

    await prisma.resume.updateMany({
      where: { userId: user.id, isCurrent: true },
      data: { isCurrent: false },
    })

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: file.name,
        fileUrl: url,
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

    return NextResponse.json({
      resume,
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
