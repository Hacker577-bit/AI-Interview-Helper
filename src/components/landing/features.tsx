import { Brain, FileText, MessageSquare, Mic, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Upload your resume and let AI extract your skills, experience, and key talking points.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    icon: Brain,
    title: "Smart Question Generation",
    description:
      "Get role-specific interview questions tailored to your resume and target job.",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    icon: MessageSquare,
    title: "Real-time Feedback",
    description:
      "Receive instant scoring on clarity, relevance, depth, and delivery.",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track your improvement over time with detailed analytics and score trends.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    icon: Mic,
    title: "Voice & Text Modes",
    description:
      "Practice in text or voice mode for a realistic interview experience.",
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Identify your weak areas and get a personalized learning roadmap.",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  },
]

export function Features() {
  return (
    <section id="features" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Succeed
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our platform combines cutting-edge AI with proven interview preparation
            techniques to give you the edge.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div
                className={cn(
                  "inline-flex h-12 w-12 items-center justify-center rounded-lg",
                  feature.color
                )}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
