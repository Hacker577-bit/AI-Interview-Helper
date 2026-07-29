import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  verifyPassword,
  createSession,
  setSessionCookie,
  normalizeEmail,
  checkAccountLockout,
  recordFailedAttempt,
  resetFailedAttempts,
} from "@/lib/auth"
import { loginSchema } from "@/lib/validators"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const rateResult = rateLimiters.auth(ip)
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(rateResult) }
    )
  }

  try {
    const body = await request.json()

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { email, password } = parsed.data
    const normalizedEmail = normalizeEmail(email)

    const lockoutCheck = checkAccountLockout(normalizedEmail)
    if (lockoutCheck.locked) {
      return NextResponse.json(
        { error: "Account is temporarily locked due to too many failed attempts. Please try again later." },
        { status: 429 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        targetRole: true,
        experienceLevel: true,
        planTier: true,
        createdAt: true,
        password: true,
      },
    })

    if (!user || !user.password) {
      recordFailedAttempt(normalizedEmail)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      recordFailedAttempt(normalizedEmail)
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401, headers: getRateLimitHeaders(rateResult) }
      )
    }

    resetFailedAttempts(normalizedEmail)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = await createSession(user.id)
    await setSessionCookie(token)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { user: userWithoutPassword, token },
      { headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
