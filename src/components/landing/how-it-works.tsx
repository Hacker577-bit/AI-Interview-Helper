import { ArrowRight, FileUp, MessageSquare, BarChart3 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: FileUp,
    title: "Upload Your Resume",
    description:
      "Our AI parses your background to understand your unique profile and career trajectory.",
  },
  {
    number: "02",
    icon: MessageSquare,
    title: "Start Your Interview",
    description:
      "AI generates personalized questions and conducts a realistic interview tailored to your target role.",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Get Instant Feedback",
    description:
      "Receive detailed scores, strengths, weaknesses, and actionable improvement tips.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three Simple Steps to Success
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From upload to landing the job - here&apos;s how the journey works.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 lg:grid-cols-3">
          <div className="absolute top-1/2 left-8 right-8 hidden h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 lg:block" />
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/25 transition-transform hover:scale-105">
                <step.icon className="h-9 w-9 text-white" />
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-white text-xs font-bold text-primary shadow dark:bg-foreground dark:text-background">
                  {index + 1}
                </span>
              </div>

              <h3 className="mt-6 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <div className="absolute right-0 top-24 hidden translate-x-1/2 lg:block">
                  <ArrowRight className="h-6 w-6 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
