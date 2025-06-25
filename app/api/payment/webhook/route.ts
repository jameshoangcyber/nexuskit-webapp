import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "whsec_...")

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object
        console.log("Payment succeeded:", paymentIntent.id)
        // Update order status in database
        break
      case "payment_intent.payment_failed":
        const failedPayment = event.data.object
        console.log("Payment failed:", failedPayment.id)
        // Handle failed payment
        break
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
