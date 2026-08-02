"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Brain } from "lucide-react"

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
        <Link href="/" className="group flex items-center gap-2.5 text-xl font-bold text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 font-bold text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5" />
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
            href="/login"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-gradient-to-r from-primary to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
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
                href="/login"
                className="rounded-lg border border-border px-4 py-2 text-center text-sm font-medium transition-colors hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
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
