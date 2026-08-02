import Link from "next/link"
import { ArrowRight, Play, Sparkles, CheckCircle2 } from "lucide-react"

const heroPoints = [
  "Personalized questions from your resume",
  "Real-time AI coaching feedback",
  "Voice & text practice modes",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-indigo-600 to-purple-700 pt-28 pb-20 lg:pt-36 lg:pb-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-blob" />
        <div className="absolute top-1/2 right-0 h-80 w-80 -translate-y-1/2 rounded-full bg-fuchsia-400/20 blur-3xl animate-blob [animation-delay:3s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl animate-blob [animation-delay:6s]" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-300" />
              AI-Powered Interview Preparation
            </span>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ace Your Next Interview{" "}
              <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-pink-200 bg-clip-text text-transparent">
                with AI
              </span>
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/85">
              Practice with an intelligent AI interviewer that adapts to your resume and
              target role, get real-time feedback on every answer, and land your dream job faster.
            </p>

            <ul className="space-y-2">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-2xl hover:-translate-y-0.5"
              >
                Start Practicing Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10 hover:-translate-y-0.5"
              >
                <Play className="h-5 w-5" />
                See How It Works
              </Link>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {["from-blue-400 to-cyan-300", "from-pink-400 to-rose-300", "from-emerald-400 to-teal-300", "from-amber-400 to-orange-300"].map((g) => (
                  <div
                    key={g}
                    className={`h-8 w-8 rounded-full border-2 border-white/30 bg-gradient-to-br ${g}`}
                  />
                ))}
              </div>
              <p className="text-sm text-white/75">
                Trusted by <span className="font-semibold text-white">5,000+</span> candidates
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative mx-auto max-w-sm animate-float">
              <div className="absolute -inset-4 rounded-3xl bg-white/10 blur-2xl" />
              <div className="relative rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-indigo-500 text-sm font-bold text-white">
                    AI
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Interview Copilot</p>
                    <p className="text-xs text-white/60">Live session</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                    Live
                  </span>
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

                  <div className="rounded-xl rounded-bl-sm bg-gradient-to-r from-white/20 to-white/10 p-3">
                    <p className="text-sm font-medium text-white/90">
                      Strong example. Can you quantify the impact and how you handled data
                      consistency across services?
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2">
                  <div className="h-2 flex-1 animate-pulse rounded bg-white/20" />
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <span className="text-[10px] text-white/80">AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent" />
    </section>
  )
}
