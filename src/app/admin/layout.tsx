import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import AdminLayoutClient from "./layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const isAdmin = user.email === process.env.ADMIN_EMAIL

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return <AdminLayoutClient user={user}>{children}</AdminLayoutClient>
}
