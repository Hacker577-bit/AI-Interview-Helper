"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { cn } from "@/lib/utils"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div
            className={cn(
              "h-8 w-8 animate-spin rounded-full border-4 border-muted",
              "border-t-primary"
            )}
          />
        </div>
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
