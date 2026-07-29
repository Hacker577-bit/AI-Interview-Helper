"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            I
          </div>
          InterviewAI
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/sign-in"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started Free
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-2 px-4 py-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              <Link
                href="/sign-in"
                className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get Started Free
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
