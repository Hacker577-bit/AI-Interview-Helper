import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [totalUsers, totalSessions, proUsers, enterpriseUsers, recentSignups] = await Promise.all([
    prisma.user.count(),
    prisma.interviewSession.count(),
    prisma.user.count({ where: { planTier: "PRO" } }),
    prisma.user.count({ where: { planTier: "ENTERPRISE" } }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        planTier: true,
        createdAt: true,
      },
    }),
  ])

  const completedSessions = await prisma.interviewSession.count({
    where: { status: "COMPLETED" },
  })

  const avgScoreResult = await prisma.feedbackReport.aggregate({
    _avg: { overallScore: true },
  })

  const freeUsers = totalUsers - proUsers - enterpriseUsers

  return NextResponse.json({
    totalUsers,
    totalSessions,
    completedSessions,
    proUsers,
    enterpriseUsers,
    freeUsers,
    mrrEstimate: proUsers * 19 + enterpriseUsers * 99,
    avgScore: avgScoreResult._avg.overallScore
      ? Math.round(avgScoreResult._avg.overallScore)
      : 0,
    recentSignups,
    usersByPlan: {
      free: freeUsers,
      pro: proUsers,
      enterprise: enterpriseUsers,
    },
    servers: [
      { name: "API Server", status: "healthy", uptime: "99.9%" },
      { name: "Database", status: "healthy", uptime: "99.99%" },
      { name: "AI Service", status: "healthy", uptime: "99.7%" },
    ],
  })
}
