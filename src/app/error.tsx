"use client"

import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-muted-foreground mb-6 max-w-md text-center">
        {error.message || "An unexpected error occurred."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border hover:bg-accent"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}
