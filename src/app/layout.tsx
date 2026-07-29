import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/shared/providers"
import { Toaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"

export const metadata: Metadata = {
  title: "AI Interview Copilot - Ace Your Next Interview",
  description: "Practice interviews with AI, get real-time feedback, and land your dream job.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <AuthProvider>
            {children}
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
