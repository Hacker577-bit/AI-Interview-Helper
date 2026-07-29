import { NextResponse } from "next/server"
import { getCurrentUser } from "./auth"
import { rateLimiters, getRateLimitHeaders } from "./rate-limit"

export async function withAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new ApiError("Unauthorized", 401)
  }
  return user
}

export function withRateLimit(
  limiter: (key: string) => ReturnType<typeof rateLimiters.api>,
  req: Request
) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  const result = limiter(ip)
  if (!result.success) {
    throw new ApiError("Too many requests. Please try again later.", 429)
  }
  return getRateLimitHeaders(result)
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = "ApiError"
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error("Unhandled API error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

export function successResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  const headers: Record<string, string> = { ...extraHeaders }
  return NextResponse.json(data, { status, headers })
}
