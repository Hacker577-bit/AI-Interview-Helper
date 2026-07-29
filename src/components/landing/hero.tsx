import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { cn } from "@/lib/utils"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-indigo-600 pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              AI-Powered Interview Preparation
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ace Your Next Interview with AI
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/80">
              Practice with an intelligent AI interviewer, get real-time feedback on your
              answers, and land your dream job faster.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
              >
                Start Practicing Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                <Play className="h-5 w-5" />
                See How It Works
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white/20" />
                  <div>
                    <div className="h-2.5 w-20 rounded bg-white/20" />
                    <div className="mt-1 h-2 w-14 rounded bg-white/10" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl rounded-bl-sm bg-white/15 p-3">
                    <p className="text-sm leading-relaxed text-white/90">
                      Tell me about a challenging project you led. What was your approach,
                      and what was the outcome?
                    </p>
                  </div>

                  <div className="rounded-xl rounded-br-sm bg-white/20 p-3">
                    <p className="text-sm leading-relaxed text-white/90">
                      At my previous role, I led the migration of our monolithic
                      application to a microservices architecture. I started by identifying
                      bounded contexts, then prioritized services by business value...
                    </p>
                  </div>

                  <div className="rounded-xl rounded-bl-sm bg-white/15 p-3">
                    <p className="text-sm font-medium text-white/90">
                      That is a strong example. Can you elaborate on how you handled data
                      consistency across services?
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2">
                  <div className="h-2 flex-1 rounded bg-white/20" />
                  <div className="h-5 w-5 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
