import { prisma } from "@/lib/db"
import { PLANS } from "@/lib/stripe"

const FREE_LIMIT = 3

export function getPlanLimits(planTier: string): { interviewsPerMonth: number; features: string[] } {
  if (planTier === "ENTERPRISE") {
    return {
      interviewsPerMonth: -1,
      features: PLANS.ENTERPRISE.features,
    }
  }
  if (planTier === "PRO") {
    return {
      interviewsPerMonth: PLANS.PRO_MONTHLY.interviewsPerMonth,
      features: PLANS.PRO_MONTHLY.features,
    }
  }
  return {
    interviewsPerMonth: FREE_LIMIT,
    features: [],
  }
}

export async function checkInterviewQuota(
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planTier: true, interviewUsageMonth: true, interviewUsageReset: true },
  })

  if (!user) {
    return { allowed: false, reason: "User not found" }
  }

  const now = new Date()

  if (user.interviewUsageReset && now > user.interviewUsageReset) {
    await prisma.user.update({
      where: { id: userId },
      data: { interviewUsageMonth: 0, interviewUsageReset: getNextMonthReset() },
    })
    return { allowed: true }
  }

  const limits = getPlanLimits(user.planTier)

  if (limits.interviewsPerMonth === -1) {
    return { allowed: true }
  }

  if (user.interviewUsageMonth >= limits.interviewsPerMonth) {
    if (user.planTier === "FREE") {
      return { allowed: false, reason: "Upgrade required - Free plan limited to 3 interviews per month" }
    }
    return { allowed: false, reason: "Limit reached - you have used all interviews for this billing period" }
  }

  return { allowed: true }
}

export async function incrementInterviewUsage(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { interviewUsageReset: true, interviewUsageMonth: true },
  })

  if (!user) return

  const now = new Date()

  if (user.interviewUsageReset && now > user.interviewUsageReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        interviewUsageMonth: 1,
        interviewUsageReset: getNextMonthReset(),
      },
    })
    return
  }

  if (!user.interviewUsageReset) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        interviewUsageMonth: user.interviewUsageMonth + 1,
        interviewUsageReset: getNextMonthReset(),
      },
    })
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: { interviewUsageMonth: user.interviewUsageMonth + 1 },
  })
}

export async function resetMonthlyUsage(): Promise<void> {
  const now = new Date()
  await prisma.user.updateMany({
    where: { interviewUsageReset: { lt: now } },
    data: {
      interviewUsageMonth: 0,
      interviewUsageReset: getNextMonthReset(),
    },
  })
}

function getNextMonthReset(): Date {
  const now = new Date()
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0)
  return reset
}
