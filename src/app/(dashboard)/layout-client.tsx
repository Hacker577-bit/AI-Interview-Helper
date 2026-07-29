"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"

const pathTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/interviews": "Interviews",
  "/dashboard/history": "History",
  "/dashboard/resume": "My Resume",
  "/dashboard/skill-gap": "Skill Gap Analysis",
  "/dashboard/learning-path": "Learning Path",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
}

interface DashboardLayoutClientProps {
  user: {
    name: string | null
    email: string
    avatarUrl: string | null
  }
  children: React.ReactNode
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const title = pathTitles[pathname] ?? "Dashboard"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
