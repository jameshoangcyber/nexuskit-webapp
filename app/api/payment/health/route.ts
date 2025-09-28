import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  const timestamp = new Date().toISOString()
  const checks: any = {
    timestamp,
    status: "healthy",
    checks: {},
  }

  try {
    // Check Stripe configuration
    checks.checks.stripe = {
      configured: !!process.env.STRIPE_SECRET_KEY,
      publishableKeyConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      webhookSecretConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
    }

    // Test Stripe connection if configured
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
          apiVersion: "2024-06-20",
        })

        // Test API connection
        await stripe.balance.retrieve()
        checks.checks.stripe.connection = "healthy"
        checks.checks.stripe.version = stripe.VERSION
      } catch (stripeError: any) {
        checks.checks.stripe.connection = "failed"
        checks.checks.stripe.error = stripeError.message
        checks.status = "degraded"
      }
    }

    // Check database connection
    try {
      const { connectToDatabase } = await import("@/lib/mongodb")
      const { db } = await connectToDatabase()
      await db.admin().ping()
      checks.checks.database = { connection: "healthy" }
    } catch (dbError: any) {
      checks.checks.database = {
        connection: "failed",
        error: dbError.message,
      }
      checks.status = "degraded"
    }

    return NextResponse.json(checks)
  } catch (error: any) {
    return NextResponse.json(
      {
        timestamp,
        status: "unhealthy",
        error: error.message,
        checks,
      },
      { status: 500 },
    )
  }
}
