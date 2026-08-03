"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon, Check, Zap, Users, Shield, MessageSquare, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { FormSkeleton } from "@/components/ui/skeleton"

const tabs = ["Profile", "Preferences", "Billing"] as const
type Tab = (typeof tabs)[number]

const proFeatures = [
  { icon: Zap, text: "Unlimited interviews" },
  { icon: MessageSquare, text: "Voice & Video mode" },
  { icon: Shield, text: "Advanced AI feedback" },
  { icon: Users, text: "Mock peer interviews" },
  { icon: Check, text: "Priority support" },
]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("Profile")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [profile, setProfile] = useState({
    name: "User",
    email: "user@example.com",
    targetRole: "Software Engineer",
    experienceLevel: "MID",
  })

  const [preferences, setPreferences] = useState({
    defaultInterviewType: "BEHAVIORAL",
    defaultDifficulty: "MID",
  })

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleSaveProfile = () => {
    setSaving(true)
    setError(null)
    setTimeout(() => {
      setSaving(false)
      toast.success("Profile updated", { description: "Your profile has been saved successfully." })
    }, 800)
  }

  const handleSavePreferences = () => {
    setSaving(true)
    setError(null)
    setTimeout(() => {
      setSaving(false)
      toast.success("Preferences saved", { description: "Your preferences have been updated." })
    }, 800)
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
        <div>
          <div className="h-8 w-28 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex gap-2 border-b pb-2">
          {tabs.map((tab) => (
            <div key={tab} className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ))}
        </div>
        <div className="rounded-xl border bg-card p-6">
          <FormSkeleton fields={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
          {error}
        </div>
      )}

      {activeTab === "Profile" && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="w-full rounded-lg border bg-muted px-3 py-2.5 text-sm text-muted-foreground"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Target Role
              </label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) =>
                  setProfile({ ...profile, targetRole: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Experience Level
              </label>
              <select
                value={profile.experienceLevel}
                onChange={(e) =>
                  setProfile({ ...profile, experienceLevel: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === "Preferences" && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-5">
            {mounted && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Theme
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                      theme === "system"
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    System
                  </button>
                </div>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Default Interview Type
              </label>
              <select
                value={preferences.defaultInterviewType}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    defaultInterviewType: e.target.value,
                  })
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="TECHNICAL">Technical</option>
                <option value="CASE_STUDY">Case Study</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Default Difficulty
              </label>
              <select
                value={preferences.defaultDifficulty}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    defaultDifficulty: e.target.value,
                  })
                }
                className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>
            <button
              onClick={handleSavePreferences}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Preferences"
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Current Plan</h3>
                <p className="text-sm text-muted-foreground">
                  You are on the Free plan.
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                FREE
              </span>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  $19/month · Unlock your full interview potential
                </p>
              </div>
            </div>
            <ul className="mb-6 space-y-3">
              {proFeatures.map((feature) => (
                <li key={feature.text} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {feature.text}
                </li>
              ))}
            </ul>
            <button className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90">
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
