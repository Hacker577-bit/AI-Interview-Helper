import { Brain, FileText, MessageSquare, Mic, Target, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Upload your resume and let AI extract your skills, experience, and key talking points.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-400",
  },
  {
    icon: Brain,
    title: "Smart Question Generation",
    description:
      "Get role-specific interview questions tailored to your resume and target job.",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    gradient: "from-purple-500 to-purple-400",
  },
  {
    icon: MessageSquare,
    title: "Real-time Feedback",
    description:
      "Receive instant scoring on clarity, relevance, depth, and delivery.",
    color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    gradient: "from-emerald-500 to-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track your improvement over time with detailed analytics and score trends.",
    color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    gradient: "from-amber-500 to-amber-400",
  },
  {
    icon: Mic,
    title: "Voice & Text Modes",
    description:
      "Practice in text or voice mode for a realistic interview experience.",
    color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
    gradient: "from-rose-500 to-rose-400",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Identify your weak areas and get a personalized AI learning roadmap.",
    color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
    gradient: "from-cyan-500 to-cyan-400",
  },
]

export function Features() {
  return (
    <section id="features" className="relative bg-background py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-dotted opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div
                className={cn(
                  "pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-20",
                  feature.gradient
                )}
              />
              <div
                className={cn(
                  "relative inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                  feature.color
                )}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
