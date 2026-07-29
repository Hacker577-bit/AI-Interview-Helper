import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError } from "@/lib/api-helpers"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
