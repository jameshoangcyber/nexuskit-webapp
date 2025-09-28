"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, AlertCircle, CheckCircle, Bug } from "lucide-react"
import toast from "react-hot-toast"

// Debug Stripe configuration
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
console.log("🔧 Stripe Configuration:", {
  hasPublishableKey: !!publishableKey,
  keyPrefix: publishableKey?.substring(0, 3) || "missing",
  keyLength: publishableKey?.length || 0,
})

const stripePromise = loadStripe(publishableKey || "")

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    // Check API status on mount
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/payment/create-intent", {
          method: "GET",
        })
        const status = await response.json()
        setDebugInfo(status)
        console.log("🔍 Payment API Status:", status)
      } catch (error) {
        console.error("❌ Failed to check API status:", error)
      }
    }

    checkApiStatus()
  }, [])

  const handleCardChange = (event: any) => {
    setCardComplete(event.complete)
    if (event.error) {
      setError(event.error.message)
    } else {
      setError(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    console.log("🚀 Starting payment process:", { amount, stripe: !!stripe, elements: !!elements })

    if (!stripe || !elements) {
      const errorMsg = "Hệ thống thanh toán chưa sẵn sàng. Vui lòng thử lại."
      setError(errorMsg)
      onError(errorMsg)
      return
    }

    if (!cardComplete) {
      const errorMsg = "Vui lòng nhập đầy đủ thông tin thẻ."
      setError(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      console.log("📤 Creating payment intent...")

      // Create payment intent with detailed logging
      const requestBody = {
        amount: Math.round(amount),
        currency: "vnd",
        metadata: {
          source: "checkout",
          timestamp: new Date().toISOString(),
        },
      }

      console.log("📋 Request body:", requestBody)

      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      console.log("📥 Response status:", response.status, response.statusText)

      const responseText = await response.text()
      console.log("📄 Raw response:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("❌ Failed to parse response JSON:", parseError)
        throw new Error(`Server trả về dữ liệu không hợp lệ: ${responseText.substring(0, 100)}`)
      }

      console.log("📊 Parsed response:", responseData)

      if (!response.ok) {
        const errorMessage = responseData.error || `HTTP ${response.status}: ${response.statusText}`
        console.error("❌ API Error:", {
          status: response.status,
          error: responseData.error,
          code: responseData.code,
          debug: responseData.debug,
        })
        throw new Error(errorMessage)
      }

      if (!responseData.clientSecret) {
        console.error("❌ Missing clientSecret in response:", responseData)
        throw new Error("Không nhận được thông tin thanh toán từ server")
      }

      console.log("✅ Payment intent created, confirming payment...")

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Không tìm thấy thông tin thẻ")
      }

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(responseData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "NexusKit Customer",
          },
        },
      })

      if (confirmError) {
        console.error("❌ Payment confirmation error:", confirmError)

        // Handle specific error types
        switch (confirmError.type) {
          case "card_error":
            throw new Error(confirmError.message || "Thẻ của bạn bị từ chối")
          case "validation_error":
            throw new Error("Thông tin thẻ không hợp lệ")
          case "api_connection_error":
            throw new Error("Không thể kết nối đến hệ thống thanh toán")
          case "api_error":
            throw new Error("Lỗi hệ thống thanh toán")
          case "authentication_error":
            throw new Error("Lỗi xác thực thanh toán")
          case "rate_limit_error":
            throw new Error("Quá nhiều yêu cầu, vui lòng thử lại sau")
          default:
            throw new Error(confirmError.message || "Lỗi thanh toán không xác định")
        }
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("✅ Payment succeeded:", paymentIntent.id)
        toast.success("Thanh toán thành công!")
        onSuccess()
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        setError("Thanh toán cần xác thực thêm. Vui lòng làm theo hướng dẫn.")
      } else {
        console.error("❌ Unexpected payment status:", paymentIntent?.status)
        throw new Error("Thanh toán không thành công")
      }
    } catch (error: any) {
      console.error("❌ Payment processing error:", error)
      const errorMessage = error.message || "Có lỗi xảy ra trong quá trình thanh toán"
      setError(errorMessage)
      onError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thông tin thẻ
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            <Bug className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {showDebug && debugInfo && (
          <Alert className="mb-4">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <details>
                <summary className="cursor-pointer">Debug Info</summary>
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-600 rounded-lg bg-gray-700">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#ffffff",
                    fontFamily: '"Inter", sans-serif',
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                  invalid: {
                    color: "#ef4444",
                  },
                  complete: {
                    color: "#10b981",
                  },
                },
                hidePostalCode: true,
              }}
              onChange={handleCardChange}
            />
          </div>

          <Button
            type="submit"
            disabled={!stripe || isLoading || !cardComplete}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Thanh toán{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(amount)}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface StripePaymentProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

export default function StripePayment({ amount, onSuccess, onError }: StripePaymentProps) {
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Stripe is properly configured
    if (!publishableKey) {
      setStripeError("Hệ thống thanh toán chưa được cấu hình (thiếu publishable key)")
    } else if (!publishableKey.startsWith("pk_")) {
      setStripeError("Cấu hình hệ thống thanh toán không hợp lệ")
    }
  }, [])

  if (stripeError) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{stripeError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
