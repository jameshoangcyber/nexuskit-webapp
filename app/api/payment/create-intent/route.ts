import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with better error handling
const initializeStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.error("❌ STRIPE_SECRET_KEY is missing from environment variables")
    return null
  }

  if (!secretKey.startsWith("sk_")) {
    console.error("❌ STRIPE_SECRET_KEY appears to be invalid (should start with 'sk_')")
    return null
  }

  try {
    return new Stripe(secretKey, {
      apiVersion: "2024-06-20",
      typescript: true,
    })
  } catch (error) {
    console.error("❌ Failed to initialize Stripe:", error)
    return null
  }
}

const stripe = initializeStripe()

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  console.log(`🔄 [${requestId}] Payment intent request started`)

  try {
    // Check Stripe initialization
    if (!stripe) {
      console.error(`❌ [${requestId}] Stripe not initialized`)
      return NextResponse.json(
        {
          error: "Hệ thống thanh toán chưa được cấu hình đúng",
          code: "STRIPE_NOT_CONFIGURED",
          requestId,
          debug: {
            hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
            keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 3) || "missing",
          },
        },
        { status: 500 },
      )
    }

    // Parse request body with better error handling
    let body
    try {
      const rawBody = await request.text()
      console.log(`📝 [${requestId}] Raw request body:`, rawBody)

      if (!rawBody.trim()) {
        throw new Error("Empty request body")
      }

      body = JSON.parse(rawBody)
      console.log(`📋 [${requestId}] Parsed body:`, body)
    } catch (parseError: any) {
      console.error(`❌ [${requestId}] JSON parse error:`, parseError.message)
      return NextResponse.json(
        {
          error: "Dữ liệu yêu cầu không hợp lệ",
          code: "INVALID_JSON",
          requestId,
          debug: { parseError: parseError.message },
        },
        { status: 400 },
      )
    }

    const { amount, currency = "vnd", metadata = {} } = body

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      console.error(`❌ [${requestId}] Invalid amount:`, amount)
      return NextResponse.json(
        {
          error: "Số tiền không hợp lệ",
          code: "INVALID_AMOUNT",
          requestId,
          debug: { receivedAmount: amount, type: typeof amount },
        },
        { status: 400 },
      )
    }

    // For VND, amount should be in dong (no conversion needed)
    // For other currencies, Stripe expects cents
    const stripeAmount = currency.toLowerCase() === "vnd" ? Math.round(amount) : Math.round(amount * 100)

    console.log(`💰 [${requestId}] Processing payment:`, {
      originalAmount: amount,
      stripeAmount,
      currency: currency.toLowerCase(),
    })

    // Create payment intent with detailed logging
    console.log(`🔄 [${requestId}] Creating Stripe payment intent...`)

    const paymentIntentParams = {
      amount: stripeAmount,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        ...metadata,
        requestId,
        originalAmount: amount.toString(),
        createdAt: new Date().toISOString(),
      },
      description: `NexusKit Order - ${amount.toLocaleString("vi-VN")} ${currency.toUpperCase()}`,
    }

    console.log(`📤 [${requestId}] Stripe params:`, paymentIntentParams)

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams)

    console.log(`✅ [${requestId}] Payment intent created successfully:`, {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      hasClientSecret: !!paymentIntent.client_secret,
    })

    // Validate response
    if (!paymentIntent.client_secret) {
      console.error(`❌ [${requestId}] Payment intent created but missing client_secret`)
      return NextResponse.json(
        {
          error: "Lỗi tạo thông tin thanh toán",
          code: "MISSING_CLIENT_SECRET",
          requestId,
        },
        { status: 500 },
      )
    }

    const response = {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: currency.toLowerCase(),
      requestId,
    }

    console.log(`✅ [${requestId}] Sending successful response`)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error(`❌ [${requestId}] Payment intent creation failed:`, {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    })

    // Handle specific Stripe errors
    if (error.type) {
      switch (error.type) {
        case "StripeCardError":
          return NextResponse.json(
            {
              error: "Thẻ của bạn bị từ chối. Vui lòng thử thẻ khác.",
              code: "CARD_DECLINED",
              requestId,
            },
            { status: 400 },
          )

        case "StripeRateLimitError":
          return NextResponse.json(
            {
              error: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
              code: "RATE_LIMIT",
              requestId,
            },
            { status: 429 },
          )

        case "StripeInvalidRequestError":
          return NextResponse.json(
            {
              error: "Yêu cầu không hợp lệ. Vui lòng kiểm tra thông tin.",
              code: "INVALID_REQUEST",
              requestId,
              debug: { stripeMessage: error.message },
            },
            { status: 400 },
          )

        case "StripeAPIError":
          return NextResponse.json(
            {
              error: "Lỗi hệ thống thanh toán. Vui lòng thử lại sau.",
              code: "API_ERROR",
              requestId,
            },
            { status: 502 },
          )

        case "StripeConnectionError":
          return NextResponse.json(
            {
              error: "Không thể kết nối đến hệ thống thanh toán. Vui lòng thử lại.",
              code: "CONNECTION_ERROR",
              requestId,
            },
            { status: 503 },
          )

        case "StripeAuthenticationError":
          return NextResponse.json(
            {
              error: "Lỗi xác thực hệ thống thanh toán.",
              code: "AUTH_ERROR",
              requestId,
              debug: { message: "Check STRIPE_SECRET_KEY configuration" },
            },
            { status: 401 },
          )
      }
    }

    // Generic error fallback
    return NextResponse.json(
      {
        error: "Có lỗi xảy ra trong quá trình xử lý thanh toán. Vui lòng thử lại sau.",
        code: "INTERNAL_ERROR",
        requestId,
        debug: {
          message: error.message,
          hasStripe: !!stripe,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}

// Add a GET endpoint for debugging
export async function GET() {
  const timestamp = new Date().toISOString()

  return NextResponse.json({
    status: "Payment API Status",
    timestamp,
    environment: {
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 3) || "missing",
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 3) || "missing",
      nodeEnv: process.env.NODE_ENV,
    },
    stripe: {
      initialized: !!stripe,
      version: stripe?.VERSION || "not available",
    },
  })
}
