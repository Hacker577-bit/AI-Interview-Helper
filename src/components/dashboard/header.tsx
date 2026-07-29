"use client"

import { useTheme } from "next-themes"
import { Bell, Sun, Moon, Menu } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  onMenuClick: () => void
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
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

        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary sm:flex">
          U
        </div>
      </div>
    </header>
  )
}
