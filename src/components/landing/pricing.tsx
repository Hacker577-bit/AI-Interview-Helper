"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const MONTHLY_FEATURES = [
  "30 interviews/month",
  "Voice + Text mode",
  "Detailed AI feedback",
  "Skill gap analysis",
  "Learning roadmap",
  "Priority support",
]
const YEARLY_FEATURES = [
  "30 interviews/month",
  "Voice + Text mode",
  "Detailed AI feedback",
  "Skill gap analysis",
  "Learning roadmap",
  "Priority support",
]
const ENTERPRISE_FEATURES = [
  "Unlimited interviews",
  "Everything in Pro",
  "Team management",
  "Custom templates",
  "Advanced analytics",
  "SSO integration",
]

const plans = [
  {
    name: "Free",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    period: "/mo",
    description: "Perfect for getting started",
    features: [
      "3 interviews/month",
      "Text mode",
      "Basic feedback",
      "Resume analysis",
    ],
    cta: "Get Started",
    planId: null,
    highlighted: false,
  },
  {
    name: "Pro",
    monthlyPrice: "$19",
    yearlyPrice: "$15",
    period: "/mo",
    description: "For serious job seekers",
    features: MONTHLY_FEATURES,
    cta: "Start Free Trial",
    planIdMonthly: "PRO_MONTHLY",
    planIdYearly: "PRO_YEARLY",
    highlighted: true,
    yearlyNote: "$180 billed annually — save $48/year",
  },
  {
    name: "Enterprise",
    monthlyPrice: "$49",
    yearlyPrice: "$49",
    period: "/seat/mo",
    description: "For teams and organizations",
    features: ENTERPRISE_FEATURES,
    cta: "Contact Sales",
    planId: "ENTERPRISE",
    highlighted: false,
  },
]

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  async function handleCheckout(plan: string) {
    if (!user) {
      router.push("/signup?plan=pro")
      return
    }

    setCheckoutLoading(plan)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (json.url) {
        router.push(json.url)
      } else if (json.error?.includes("test mode")) {
        router.push("/signup?plan=pro")
      } else {
        router.push("/login")
      }
    } catch {
      router.push("/login")
    } finally {
      setCheckoutLoading(null)
    }
  }

  return (
    <section id="pricing" className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your interview preparation needs.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span
              className={cn(
                "text-sm font-medium",
                !yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                yearly ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow ring-0 transition-transform",
                  yearly ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <span
              className={cn(
                "text-sm font-medium",
                yearly ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Yearly
            </span>
            {yearly && (
              <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                Save 20%
              </span>
            )}
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const price = yearly ? plan.yearlyPrice : plan.monthlyPrice
            const isFreePlan = plan.name === "Free"
            const isEnterprisePlan = plan.name === "Enterprise"
            const isCurrentFreePlan = isFreePlan && user
            const planId = isFreePlan
              ? null
              : isEnterprisePlan
                ? plan.planId
                : yearly
                  ? plan.planIdYearly
                  : plan.planIdMonthly

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover",
                  plan.highlighted
                    ? "border-primary shadow-xl shadow-primary/15 ring-1 ring-primary"
                    : "border-border shadow-card"
                )}
              >
                {plan.highlighted && (
                  <>
                    <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-indigo-500/20" />
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-indigo-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-primary/30">
                      Most Popular
                    </span>
                  </>
                )}

                <div className="relative mb-6">
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="relative mb-6">
                  <span className={cn("text-4xl font-bold", plan.highlighted && "text-gradient")}>
                    {price}
                  </span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                  {plan.yearlyNote && yearly && (
                    <p className="mt-1 text-xs text-muted-foreground">{plan.yearlyNote}</p>
                  )}
                </div>

                <ul className="relative mb-8 flex-1 space-y-3">
                  {(yearly && !isFreePlan && !isEnterprisePlan
                    ? YEARLY_FEATURES
                    : plan.features
                  ).map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                          plan.highlighted
                            ? "bg-gradient-to-br from-primary to-indigo-600 text-white"
                            : "bg-primary/10"
                        )}
                      >
                        <Check className="h-3.5 w-3.5 text-primary" />
                      </span>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentFreePlan ? (
                  <span
                    className={cn(
                      "relative rounded-lg px-6 py-3 text-center text-sm font-semibold",
                      "border border-border bg-muted text-muted-foreground"
                    )}
                  >
                    Current Plan
                  </span>
                ) : isEnterprisePlan ? (
                  <a
                    href={`mailto:${"sales@interviewai.com"}`}
                    className={cn(
                      "relative rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all",
                      "border border-border text-foreground hover:bg-accent"
                    )}
                  >
                    {plan.cta}
                  </a>
                ) : planId ? (
                  <button
                    onClick={() => handleCheckout(planId)}
                    disabled={checkoutLoading !== null}
                    className={cn(
                      "relative rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all disabled:opacity-50",
                      plan.highlighted
                        ? "bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5"
                        : "border border-border text-foreground hover:bg-accent"
                    )}
                  >
                    {checkoutLoading === planId ? (
                      <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                    ) : (
                      plan.cta
                    )}
                  </button>
                ) : (
                  <a
                    href="/signup"
                    className={cn(
                      "relative rounded-lg px-6 py-3 text-center text-sm font-semibold transition-all",
                      "border border-border text-foreground hover:bg-accent"
                    )}
                  >
                    Get Started
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
