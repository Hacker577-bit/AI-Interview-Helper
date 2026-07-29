import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-8xl font-extrabold tracking-tight text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Page not found</h2>
      <p className="mt-2 text-muted-foreground max-w-md text-center">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        <Home className="h-4 w-4" />
        Go back home
      </Link>
    </div>
  )
}
