import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { stripe, PLANS, isStripeConfigured } from "@/lib/stripe"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Payment system is in test mode." },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { plan, seats = 1 } = body as {
      plan: "PRO_MONTHLY" | "PRO_YEARLY" | "ENTERPRISE"
      seats?: number
    }

    const planConfig = PLANS[plan]
    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    let customerId = user.stripeCustomerId

    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId)
      } catch {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: { userId: user.id },
        })
        customerId = customer.id
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        })
      }
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      mode: "subscription",
      line_items: [
        {
          price: planConfig.stripePriceId,
          quantity: plan === "ENTERPRISE" ? seats : 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
      metadata: {
        userId: user.id,
        plan,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Checkout session error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
