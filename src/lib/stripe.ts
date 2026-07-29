import Stripe from "stripe"

const isTestMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith("sk_test_")

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20" as any,
  typescript: true,
})

export const PLANS = {
  PRO_MONTHLY: {
    name: "Pro Monthly",
    price: 1900,
    interviewsPerMonth: 30,
    features: [
      "Voice & Text mode",
      "Detailed AI feedback",
      "Skill gap analysis",
      "Learning roadmap",
      "Priority support",
    ],
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || "price_pro_monthly",
  },
  PRO_YEARLY: {
    name: "Pro Yearly",
    price: 18000,
    interviewsPerMonth: 30,
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Priority support",
    ],
    stripePriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || "price_pro_yearly",
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: 4900,
    interviewsPerMonth: -1,
    features: [
      "Unlimited interviews",
      "Team management",
      "Custom templates",
      "Advanced analytics",
      "SSO integration",
      "API access",
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise",
  },
}

export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_SECRET_KEY.length > 20 &&
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

export { isTestMode }
