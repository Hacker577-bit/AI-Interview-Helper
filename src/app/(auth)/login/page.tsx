"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Brain, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"

const benefits = [
  "AI-personalized interview questions",
  "Instant feedback on every answer",
  "Track your progress and skills",
]

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid credentials")
        return
      }

      toast.success("Welcome back!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-purple-700 lg:block">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl animate-blob" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl animate-blob [animation-delay:3s]" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Brain className="h-5 w-5" />
            </div>
            InterviewAI
          </Link>

          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Ace your next interview with confidence.
            </h2>
            <p className="mt-4 text-white/75">
              Practice with an AI interviewer that adapts to your resume and target role.
            </p>
            <ul className="mt-8 space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-3 text-white/85">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} InterviewAI. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5 text-xl font-bold text-foreground lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            InterviewAI
          </Link>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue your interview preparation
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium">
                      Password
                    </label>
                    <a href="#" className="text-xs font-medium text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign Up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
