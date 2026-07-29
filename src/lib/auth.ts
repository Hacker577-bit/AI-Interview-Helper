import crypto from "crypto"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { rateLimit, rateLimiters } from "./rate-limit"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production"
const COOKIE_NAME = "aic-session"

const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 15 * 60 * 1000

interface LockoutEntry {
  count: number
  lockedUntil: number | null
}

const failedAttempts = new Map<string, LockoutEntry>()

setInterval(() => {
  const now = Date.now()
  Array.from(failedAttempts.entries()).forEach(([key, entry]) => {
    if (!entry.lockedUntil || entry.lockedUntil < now) {
      failedAttempts.delete(key)
    }
  })
}, 10 * 60 * 1000)

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function validatePasswordStrength(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain a lowercase letter" }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain an uppercase letter" }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain a number" }
  }
  return { valid: true, message: "" }
}

function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, "")
}

function getClientIp(): string {
  return "server"
}

export function checkAccountLockout(email: string): { locked: boolean; remainingMs: number } {
  const key = normalizeEmail(email)
  const entry = failedAttempts.get(key)
  if (entry?.lockedUntil && entry.lockedUntil > Date.now()) {
    return { locked: true, remainingMs: entry.lockedUntil - Date.now() }
  }
  return { locked: false, remainingMs: 0 }
}

export function recordFailedAttempt(email: string): void {
  const key = normalizeEmail(email)
  const entry = failedAttempts.get(key) || { count: 0, lockedUntil: null }
  entry.count++
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
  }
  failedAttempts.set(key, entry)
}

export function resetFailedAttempts(email: string): void {
  const key = normalizeEmail(email)
  failedAttempts.delete(key)
}

function base64url(data: string): string {
  return Buffer.from(data).toString("base64url")
}

function decodeBase64url(data: string): string {
  return Buffer.from(data, "base64url").toString()
}

function sign(data: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url")
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export { validatePasswordStrength, normalizeEmail, sanitizeInput }

export async function createSession(userId: string): Promise<string> {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64url(
    JSON.stringify({
      sub: userId,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    })
  )
  const signature = sign(`${header}.${payload}`)
  return `${header}.${payload}.${signature}`
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const [headerB64, payloadB64, signatureB64] = parts
    const expectedSig = sign(`${headerB64}.${payloadB64}`)

    if (!crypto.timingSafeEqual(Buffer.from(signatureB64), Buffer.from(expectedSig))) {
      return null
    }

    const payload = JSON.parse(decodeBase64url(payloadB64))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null

    return { userId: payload.sub }
  } catch {
    return null
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      targetRole: true,
      experienceLevel: true,
      planTier: true,
      stripeCustomerId: true,
      interviewUsageMonth: true,
      interviewUsageReset: true,
      createdAt: true,
    },
  })
}

export function getAuthRateLimiter(identifier: string) {
  return rateLimiters.auth(identifier)
}
