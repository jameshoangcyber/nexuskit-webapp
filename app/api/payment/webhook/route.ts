import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { connectToDatabase } from "@/lib/mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
})

// Webhook logging utility
function logWebhookEvent(level: "info" | "error" | "warn", message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    level,
    service: "webhook",
    message,
    data: data ? JSON.stringify(data, null, 2) : undefined,
  }

  console.log(`[${timestamp}] [${level.toUpperCase()}] [WEBHOOK] ${message}`, data || "")
}

async function updateOrderPaymentStatus(paymentIntentId: string, status: "paid" | "failed") {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("orders").updateOne(
      { stripePaymentIntentId: paymentIntentId },
      {
        $set: {
          paymentStatus: status,
          updatedAt: new Date(),
          ...(status === "paid" && { paidAt: new Date() }),
        },
      },
    )

    logWebhookEvent("info", `Order payment status updated`, {
      paymentIntentId,
      status,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    })

    return result.modifiedCount > 0
  } catch (error: any) {
    logWebhookEvent("error", "Failed to update order payment status", {
      paymentIntentId,
      status,
      error: error.message,
    })
    return false
  }
}

export async function POST(request: NextRequest) {
  const webhookId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  try {
    logWebhookEvent("info", "Webhook received", { webhookId })

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      logWebhookEvent("error", "Missing Stripe signature", { webhookId })
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      logWebhookEvent("error", "Webhook secret not configured", { webhookId })
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err: any) {
      logWebhookEvent("error", "Webhook signature verification failed", {
        webhookId,
        error: err.message,
      })
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    logWebhookEvent("info", "Processing webhook event", {
      webhookId,
      eventType: event.type,
      eventId: event.id,
    })

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        logWebhookEvent("info", "Payment succeeded", {
          webhookId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: paymentIntent.metadata,
        })

        // Update order status in database
        const updated = await updateOrderPaymentStatus(paymentIntent.id, "paid")

        if (!updated) {
          logWebhookEvent("warn", "Order not found for successful payment", {
            webhookId,
            paymentIntentId: paymentIntent.id,
          })
        }

        // Here you could trigger additional actions:
        // - Send confirmation email
        // - Update inventory
        // - Trigger fulfillment process

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        logWebhookEvent("warn", "Payment failed", {
          webhookId,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          lastPaymentError: paymentIntent.last_payment_error,
          metadata: paymentIntent.metadata,
        })

        // Update order status in database
        await updateOrderPaymentStatus(paymentIntent.id, "failed")

        // Here you could trigger additional actions:
        // - Send payment failed email
        // - Log for fraud analysis
        // - Trigger retry logic

        break
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        logWebhookEvent("info", "Payment canceled", {
          webhookId,
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata,
        })

        break
      }

      case "payment_intent.requires_action": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        logWebhookEvent("info", "Payment requires action", {
          webhookId,
          paymentIntentId: paymentIntent.id,
          nextAction: paymentIntent.next_action?.type,
          metadata: paymentIntent.metadata,
        })

        break
      }

      default:
        logWebhookEvent("info", "Unhandled event type", {
          webhookId,
          eventType: event.type,
        })
    }

    logWebhookEvent("info", "Webhook processed successfully", { webhookId, eventType: event.type })

    return NextResponse.json({
      received: true,
      webhookId,
      eventType: event.type,
      processed: true,
    })
  } catch (error: any) {
    logWebhookEvent("error", "Webhook processing failed", {
      webhookId,
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        webhookId,
      },
      { status: 500 },
    )
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    webhook: {
      configured: !!process.env.STRIPE_WEBHOOK_SECRET,
    },
  })
}
