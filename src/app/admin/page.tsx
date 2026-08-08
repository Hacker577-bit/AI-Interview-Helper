"use client"

import { useState, useEffect } from "react"
import {
  Users,
  MessageSquare,
  CreditCard,
  TrendingUp,
  Server,
  Shield,
  UserCheck,
  AlertTriangle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDate, formatRelativeTime } from "@/lib/utils"

interface AdminStats {
  totalUsers: number
  totalSessions: number
  completedSessions: number
  proUsers: number
  enterpriseUsers: number
  freeUsers: number
  mrrEstimate: number
  avgScore: number
  recentSignups: Array<{
    id: string
    email: string
    name: string | null
    planTier: string
    createdAt: string
  }>
  usersByPlan: {
    free: number
    pro: number
    enterprise: number
  }
  servers: Array<{
    name: string
    status: string
    uptime: string
  }>
}

const mockGrowthData = [
  { month: "Jan", users: 45 },
  { month: "Feb", users: 78 },
  { month: "Mar", users: 112 },
  { month: "Apr", users: 156 },
  { month: "May", users: 198 },
  { month: "Jun", users: 234 },
  { month: "Jul", users: 289 },
]

const mockTokenUsage = [
  { day: "Mon", tokens: 12500 },
  { day: "Tue", tokens: 18200 },
  { day: "Wed", tokens: 15800 },
  { day: "Thu", tokens: 22100 },
  { day: "Fri", tokens: 19500 },
  { day: "Sat", tokens: 8900 },
  { day: "Sun", tokens: 7200 },
]

const statCards = [
  { label: "Total Users", color: "blue", icon: Users },
  { label: "Total Sessions", color: "green", icon: MessageSquare },
  { label: "MRR Estimate", color: "purple", icon: CreditCard },
  { label: "Avg Score", color: "orange", icon: TrendingUp },
]

const colorVariants: Record<string, { bg: string; text: string; darkBg: string }> = {
  blue: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    darkBg: "dark:bg-indigo-900/30",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    darkBg: "dark:bg-green-900/30",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    darkBg: "dark:bg-purple-900/30",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    darkBg: "dark:bg-orange-900/30",
  },
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value)
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats")
        if (!res.ok) throw new Error("Failed to fetch stats")
        const data = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load stats")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive">{error || "Failed to load stats"}</p>
        </div>
      </div>
    )
  }

  const statValues: Record<string, string> = {
    "Total Users": stats.totalUsers.toString(),
    "Total Sessions": stats.totalSessions.toString(),
    "MRR Estimate": formatCurrency(stats.mrrEstimate),
    "Avg Score": stats.avgScore > 0 ? `${stats.avgScore}%` : "N/A",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of platform usage and system health.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const colors = colorVariants[card.color]
          return (
            <div
              key={card.label}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-lg",
                    colors.bg,
                    colors.darkBg
                  )}
                >
                  <card.icon className={cn("h-6 w-6", colors.text)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{statValues[card.label]}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-1 text-lg font-semibold">Plan Distribution</h3>
          <p className="mb-4 text-sm text-muted-foreground">Users by subscription tier</p>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Free</span>
                <span className="text-sm text-muted-foreground">{stats.usersByPlan.free}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-slate-400"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.usersByPlan.free / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Pro</span>
                <span className="text-sm text-muted-foreground">{stats.usersByPlan.pro}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-violet-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.usersByPlan.pro / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Enterprise</span>
                <span className="text-sm text-muted-foreground">{stats.usersByPlan.enterprise}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-purple-500"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.usersByPlan.enterprise / stats.totalUsers) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-3">
          <h3 className="mb-1 text-lg font-semibold">AI Token Usage (7 Days)</h3>
          <p className="mb-4 text-sm text-muted-foreground">Daily token consumption</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockTokenUsage}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="tokens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6 shadow-sm lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">User Growth</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.5rem",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">System Health</h3>
          <div className="space-y-3">
            {stats.servers.map((server) => (
              <div
                key={server.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{server.name}</p>
                    <p className="text-xs text-muted-foreground">Uptime: {server.uptime}</p>
                  </div>
                </div>
                <Badge variant="success">{server.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Recent Signups</h3>
            <p className="text-sm text-muted-foreground">Latest user registrations</p>
          </div>
          <UserCheck className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSignups.map((signup) => (
                <tr key={signup.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-medium">
                    {signup.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {signup.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        signup.planTier === "ENTERPRISE"
                          ? "success"
                          : signup.planTier === "PRO"
                          ? "default"
                          : "outline"
                      }
                    >
                      {signup.planTier}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatRelativeTime(signup.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
