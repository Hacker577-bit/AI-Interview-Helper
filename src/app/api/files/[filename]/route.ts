import { NextRequest, NextResponse } from "next/server"
import { getFile } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await getFile(params.filename)
  if (!data) return NextResponse.json({ error: "File not found" }, { status: 404 })

  const ext = params.filename.split(".").pop()
  const contentType = ext === "pdf" ? "application/pdf" :
    ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
    "application/octet-stream"

  return new NextResponse(new Uint8Array(data), {
    headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" },
  })
}
