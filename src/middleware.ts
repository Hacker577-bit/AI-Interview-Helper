import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { checkInterviewQuota } from "@/lib/billing"

const COOKIE_NAME = "aic-session"

const publicPaths = ["/", "/login", "/signup"]

const isPublicPath = (pathname: string) => {
  return publicPaths.some((p) => p === pathname) || pathname.startsWith("/api/auth/")
}

function decodeBase64url(data: string): string {
  return Buffer.from(data, "base64url").toString()
}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(decodeBase64url(parts[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/api/webhook/stripe") {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === "/api/interview/start") {
    const userId = getUserIdFromToken(token)
    if (userId) {
      try {
        const quota = await checkInterviewQuota(userId)
        if (!quota.allowed) {
          const statusCode = quota.reason?.includes("Upgrade required") ? 402 : 402
          return NextResponse.json(
            { error: quota.reason || "Interview limit reached" },
            { status: statusCode, statusText: quota.reason || "Limit reached" }
          )
        }
      } catch (err) {
        console.error("Quota check failed in middleware:", err)
      }
    }
  }

  const response = NextResponse.next()

  // In production, allow Vercel preview URLs
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Access-Control-Allow-Origin",
      process.env.NEXT_PUBLIC_APP_URL || "*"
    )
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
