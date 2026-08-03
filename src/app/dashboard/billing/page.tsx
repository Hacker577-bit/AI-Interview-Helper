"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import {
  Check,
  Zap,
  ArrowRight,
  AlertTriangle,
  Loader2,
  XCircle,
  CreditCard,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscriptionData {
  plan: string
  status: string
  currentPeriodEnd: string | null
  interviewsUsed: number
  interviewsLimit: number
  features: string[]
  paymentHistory: {
    id: string
    amount: number
    currency: string
    status: string
    planTier: string
    periodStart: string
    periodEnd: string
    createdAt: string
  }[]
}

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    fetchSubscription()
  }, [])

  useEffect(() => {
    if (searchParams.get("success")) {
      toast.success("Payment successful! Your subscription has been activated.")
      fetchSubscription()
    }
    if (searchParams.get("canceled")) {
      toast.info("Checkout was canceled.")
    }
  }, [searchParams])

  async function fetchSubscription() {
    try {
      const res = await fetch("/api/billing/subscription")
      if (res.ok) {
        setData(await res.json())
      }
    } catch (err) {
      console.error("Failed to fetch subscription:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout(plan: "PRO_MONTHLY" | "PRO_YEARLY" | "ENTERPRISE") {
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
      } else {
        toast.error(json.error || "Failed to start checkout")
      }
    } catch {
      toast.error("Failed to start checkout")
    } finally {
      setCheckoutLoading(null)
    }
  }

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      })
      const json = await res.json()
      if (json.url) {
        router.push(json.url)
      } else {
        toast.error(json.error || "Failed to open billing portal")
      }
    } catch {
      toast.error("Failed to open billing portal")
    } finally {
      setPortalLoading(false)
    }
  }

  async function handleCancelSubscription() {
    toast.info("Please use the Stripe customer portal to manage your subscription.")
    handlePortal()
    setShowCancelConfirm(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isFree = !data || data.plan === "FREE"
  const isPro = data?.plan === "PRO"
  const isEnterprise = data?.plan === "ENTERPRISE"
  const usagePercent = data && data.interviewsLimit > 0
    ? Math.min(100, Math.round((data.interviewsUsed / data.interviewsLimit) * 100))
    : 0

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Plans</h2>
        <p className="text-muted-foreground">
          Manage your subscription, view usage, and access payment history.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              {isFree && "You are on the Free plan."}
              {isPro && "You are on the Pro plan."}
              {isEnterprise && "You are on the Enterprise plan."}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              isFree && "bg-muted text-muted-foreground",
              isPro && "bg-primary/10 text-primary",
              isEnterprise && "bg-purple-500/10 text-purple-500"
            )}
          >
            {data?.plan || "FREE"}
          </span>
        </div>

        {data && data.interviewsLimit > 0 && (
          <div className="mb-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Interview Usage</span>
              <span className="font-medium">
                {data.interviewsUsed} / {data.interviewsLimit === -1 ? "Unlimited" : data.interviewsLimit}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  usagePercent >= 90
                    ? "bg-destructive"
                    : usagePercent >= 70
                      ? "bg-yellow-500"
                      : "bg-primary"
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        {data && data.interviewsLimit === -1 && (
          <p className="text-sm text-muted-foreground">
            Unlimited interviews available with your Enterprise plan.
          </p>
        )}

        {data && data.currentPeriodEnd && (
          <p className="mt-2 text-xs text-muted-foreground">
            Usage resets on{" "}
            {new Date(data.currentPeriodEnd).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {isFree && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Pro Monthly</h3>
            </div>
            <p className="mb-4 text-3xl font-bold">
              $19<span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <ul className="mb-6 space-y-2">
              {["Voice & Text mode", "Detailed AI feedback", "Skill gap analysis", "Learning roadmap", "Priority support"].map(
                (f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {f}
                  </li>
                )
              )}
            </ul>
            <button
              onClick={() => handleCheckout("PRO_MONTHLY")}
              disabled={checkoutLoading !== null}
              className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {checkoutLoading === "PRO_MONTHLY" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Upgrade to Pro"
              )}
            </button>
          </div>

          <div className="rounded-xl border-2 border-primary bg-card p-6 shadow-sm">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Best Value
            </span>
            <div className="mb-3 flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Pro Yearly</h3>
            </div>
            <p className="mb-1 text-3xl font-bold">
              $15<span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              $180 billed annually — save $48/year
            </p>
            <ul className="mb-6 space-y-2">
              {["Everything in Pro Monthly", "2 months free", "Priority support"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout("PRO_YEARLY")}
              disabled={checkoutLoading !== null}
              className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {checkoutLoading === "PRO_YEARLY" ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Go Pro Yearly"
              )}
            </button>
          </div>
        </div>
      )}

      {(isPro || isEnterprise) && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Manage Subscription</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Manage Billing
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/50 px-6 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4" />
              Cancel Subscription
            </button>
          </div>
        </div>
      )}

      {data && data.features.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Your Features</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data && data.paymentHistory.length > 0 && (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">Payment History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Plan</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      {new Date(payment.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2 pr-4">{payment.planTier}</td>
                    <td className="py-2 pr-4">
                      ${(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}
                    </td>
                    <td className="py-2">
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <h4 className="font-semibold text-destructive">Cancel Subscription</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Are you sure? You will lose access to premium features at the end of your current
                billing period. You can manage your subscription through the Stripe customer portal.
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleCancelSubscription}
                  className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
                >
                  Open Customer Portal
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  Keep Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
