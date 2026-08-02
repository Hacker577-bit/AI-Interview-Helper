import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-purple-700 py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-10 h-64 w-64 rounded-full bg-fuchsia-400/20 blur-3xl animate-blob [animation-delay:4s]" />
      </div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Join thousands of job seekers who improved their interview skills with AI.
          </p>
          <div className="mt-8">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
