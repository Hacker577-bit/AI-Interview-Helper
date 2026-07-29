import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { stripe, isStripeConfigured } from "@/lib/stripe"

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No billing account found" },
        { status: 400 }
      )
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/dashboard/billing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Portal session error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    )
  }
}
