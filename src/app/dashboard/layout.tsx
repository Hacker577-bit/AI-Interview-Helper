import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { DashboardLayoutClient } from "./layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    user = await getCurrentUser()
  } catch {
    // User fetch may fail in dev without DB
  }

  if (!user) {
    redirect("/login")
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
}
