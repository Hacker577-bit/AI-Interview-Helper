"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  ChevronDown,
  User,
  LogOut,
  X,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminLayoutClientProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  children: React.ReactNode
}

const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Organizations", href: "/admin/organizations", icon: Building2 },
  { label: "AI Usage", href: "/admin/ai-usage", icon: BarChart3 },
  { label: "System", href: "/admin/system", icon: Settings },
]

export default function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Admin Panel</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="relative border-t p-3">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{user.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                userMenuOpen && "rotate-180"
              )}
            />
          </button>
          {userMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-1 rounded-lg border bg-card p-1 shadow-lg">
              <Link
                href="/dashboard"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <User className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
          >
            <Shield className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              Admin Mode
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
