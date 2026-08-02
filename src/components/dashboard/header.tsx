"use client"

import { useTheme } from "next-themes"
import { Bell, Sun, Moon, Menu, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { cn, getInitials } from "@/lib/utils"

interface HeaderProps {
  title: string
  onMenuClick: () => void
  user?: {
    name: string | null
    email: string
    avatarUrl: string | null
  } | null
}

export default function Header({ title, onMenuClick, user }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const initials = getInitials(user?.name || "User")

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 hover:bg-accent lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            {title}
          </h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            AI Interview Copilot
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary/10 to-indigo-500/10 px-3 py-1.5 text-xs font-medium text-primary md:inline-flex">
          <Sparkles className="h-3.5 w-3.5" />
          AI Powered
        </span>

        <button
          className="relative rounded-md p-2 hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md p-2 hover:bg-accent"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        )}

        <div
          className={cn(
            "hidden h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-xs font-bold text-white sm:flex"
          )}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
