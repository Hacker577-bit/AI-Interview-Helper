import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/billing"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        planTier: true,
        interviewUsageMonth: true,
        interviewUsageReset: true,
        stripeCustomerId: true,
        paymentRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            planTier: true,
            periodStart: true,
            periodEnd: true,
            createdAt: true,
          },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const limits = getPlanLimits(dbUser.planTier)

    return NextResponse.json({
      plan: dbUser.planTier,
      status: dbUser.stripeCustomerId ? "active" : "free",
      currentPeriodEnd: dbUser.interviewUsageReset?.toISOString() || null,
      interviewsUsed: dbUser.interviewUsageMonth,
      interviewsLimit: limits.interviewsPerMonth,
      features: limits.features,
      paymentHistory: dbUser.paymentRecords,
    })
  } catch (error) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    )
  }
}
