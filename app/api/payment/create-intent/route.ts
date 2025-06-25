import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_...", {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "vnd" } = await request.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error("Payment intent error:", error)
    return NextResponse.json({ error: "Lỗi tạo thanh toán" }, { status: 500 })
  }
}
