import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function CTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-indigo-700 py-20 lg:py-28">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Join thousands of job seekers who improved their interview skills with AI.
          </p>
          <div className="mt-8">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
