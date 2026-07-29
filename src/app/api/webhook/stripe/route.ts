import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe, isStripeConfigured } from "@/lib/stripe"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature") || ""

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      }
      case "customer.subscription.updated": {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      }
      case "customer.subscription.deleted": {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }
      case "invoice.payment_failed": {
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }
      case "invoice.payment_succeeded": {
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const clientReferenceId = session.client_reference_id

  if (!clientReferenceId) {
    console.error("No client_reference_id on checkout session")
    return
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  let planTier = "PRO"
  if (priceId === (process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise")) {
    planTier = "ENTERPRISE"
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: clientReferenceId },
      data: {
        stripeCustomerId: customerId,
        planTier,
        interviewUsageMonth: 0,
        interviewUsageReset: new Date(
          subscription.current_period_end * 1000
        ),
      },
    }),
    prisma.paymentRecord.create({
      data: {
        userId: clientReferenceId,
        stripeInvoiceId: session.invoice as string | null ?? null,
        amount: (session.amount_total || 0),
        currency: session.currency || "usd",
        status: "paid",
        planTier,
        periodStart: new Date(subscription.current_period_start * 1000),
        periodEnd: new Date(subscription.current_period_end * 1000),
      },
    }),
  ])
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error("No user found for Stripe customer:", customerId)
    return
  }

  const status = subscription.status
  let planTier = user.planTier

  if (subscription.cancel_at_period_end) {
    planTier = user.planTier
  } else if (status === "active" || status === "trialing") {
    const priceId = subscription.items.data[0]?.price.id
    if (priceId === (process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise")) {
      planTier = "ENTERPRISE"
    } else {
      planTier = "PRO"
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planTier,
      interviewUsageReset: new Date(subscription.current_period_end * 1000),
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    console.error("No user found for Stripe customer:", customerId)
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      planTier: "FREE",
      interviewUsageMonth: 0,
      interviewUsageReset: null,
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  console.warn(`Payment failed for user ${user.id}, invoice ${invoice.id}`)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) return

  const lines = invoice.lines.data[0]
  if (!lines) return

  let planTier = "PRO"
  if (lines.price?.id === (process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise")) {
    planTier = "ENTERPRISE"
  }

  await prisma.paymentRecord.create({
    data: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: "paid",
      planTier,
      periodStart: new Date(lines.period.start * 1000),
      periodEnd: new Date(lines.period.end * 1000),
    },
  })
}
