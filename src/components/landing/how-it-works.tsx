import { ArrowRight, FileUp, MessageSquare, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

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
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to transform your interview performance.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              <span className="text-5xl font-bold text-primary/20">{step.number}</span>

              <div className="relative z-10 -mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <step.icon className="h-8 w-8 text-primary-foreground" />
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
