"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  MessageSquare,
  History,
  FileText,
  Target,
  GraduationCap,
  Settings,
  ChevronDown,
  User,
  CreditCard,
  LogOut,
  Receipt,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getInitials } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Interviews", href: "/dashboard/interviews", icon: MessageSquare },
  { label: "History", href: "/dashboard/history", icon: History },
  { label: "My Resume", href: "/dashboard/resume", icon: FileText },
  { label: "Skill Gap", href: "/dashboard/skill-gap", icon: Target },
  { label: "Learning Path", href: "/dashboard/learning-path", icon: GraduationCap },
  { label: "Billing", href: "/dashboard/billing", icon: Receipt },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-card transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">InterviewAI</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              U
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-muted-foreground">user@example.com</p>
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
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <User className="h-4 w-4" />
                Profile
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <CreditCard className="h-4 w-4" />
                Billing
              </button>
              <button className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
