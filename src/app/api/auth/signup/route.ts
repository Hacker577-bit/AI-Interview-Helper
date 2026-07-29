import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  hashPassword,
  createSession,
  setSessionCookie,
  normalizeEmail,
  validatePasswordStrength,
  sanitizeInput,
} from "@/lib/auth"
import { signupSchema } from "@/lib/validators"
import { rateLimiters, getRateLimitHeaders } from "@/lib/rate-limit"
import { handleApiError } from "@/lib/api-helpers"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

  const rateResult = rateLimiters.auth(ip)
  if (!rateResult.success) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429, headers: getRateLimitHeaders(rateResult) }
    )
  }

  try {
    const body = await request.json()

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const { name, email, password } = parsed.data

    const strengthCheck = validatePasswordStrength(password)
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { error: strengthCheck.message },
        { status: 400, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const normalizedEmail = normalizeEmail(email)
    const sanitizedName = sanitizeInput(name)

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409, headers: getRateLimitHeaders(rateResult) }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: sanitizedName,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        targetRole: true,
        experienceLevel: true,
        planTier: true,
        createdAt: true,
      },
    })

    const token = await createSession(user.id)
    await setSessionCookie(token)

    return NextResponse.json(
      { user, token },
      { status: 201, headers: getRateLimitHeaders(rateResult) }
    )
  } catch (error) {
    return handleApiError(error)
  }
}
