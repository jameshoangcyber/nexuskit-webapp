"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CreditCard, AlertCircle, CheckCircle, RefreshCw, Shield, Lock, Wifi, WifiOff } from "lucide-react"
import toast from "react-hot-toast"
import { PaymentService, PaymentErrorHandler, type PaymentError } from "@/lib/payment-service"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const paymentService = PaymentService.getInstance()

  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<PaymentError | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardBrand, setCardBrand] = useState<string>("")
  const [progress, setProgress] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [paymentIntentId, setPaymentIntentId] = useState<string>("")

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Card validation and feedback
  const handleCardChange = useCallback((event: any) => {
    setCardComplete(event.complete)
    setCardBrand(event.brand || "")

    if (event.error) {
      setError({
        code: "CARD_VALIDATION",
        message: event.error.message,
        type: "validation_error",
        retryable: true,
      })
    } else {
      setError(null)
    }
  }, [])

  // Progress simulation
  const simulateProgress = useCallback(() => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 200)
    return interval
  }, [])

  // Retry payment logic
  const handleRetry = useCallback(async () => {
    if (!paymentIntentId) return

    const retryResult = await paymentService.retryPayment(paymentIntentId)
    if (!retryResult.success) {
      setError(retryResult.error!)
      return
    }

    setRetryCount((prev) => prev + 1)
    setError(null)
    handleSubmit(new Event("submit") as any)
  }, [paymentIntentId, paymentService])

  // Main payment submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    // Pre-flight checks
    if (!isOnline) {
      setError({
        code: "OFFLINE",
        message: "Không có kết nối internet",
        type: "network_error",
        retryable: true,
        suggestions: ["Kiểm tra kết nối internet và thử lại"],
      })
      return
    }

    if (!stripe || !elements) {
      setError({
        code: "STRIPE_NOT_LOADED",
        message: "Hệ thống thanh toán chưa sẵn sàng",
        type: "api_error",
        retryable: true,
        suggestions: ["Tải lại trang và thử lại"],
      })
      return
    }

    if (!cardComplete) {
      setError({
        code: "INCOMPLETE_CARD",
        message: "Vui lòng nhập đầy đủ thông tin thẻ",
        type: "validation_error",
        retryable: false,
      })
      return
    }

    setIsLoading(true)
    setError(null)
    const progressInterval = simulateProgress()

    try {
      // Step 1: Create payment intent
      setProgress(20)
      const paymentResult = await paymentService.createPaymentIntent(amount, "vnd", {
        retryCount,
        cardBrand,
        userAgent: navigator.userAgent,
      })

      if (!paymentResult.success) {
        throw paymentResult.error
      }

      // Step 2: Get client secret
      setProgress(40)
      const response = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency: "vnd",
          metadata: { retryCount, cardBrand },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw PaymentErrorHandler.handleStripeError({
          type: "api_error",
          message: data.error,
          code: data.code,
        })
      }

      setPaymentIntentId(data.paymentIntentId)
      setProgress(60)

      // Step 3: Confirm payment
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      setProgress(80)
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: "NexusKit Customer",
          },
        },
      })

      if (confirmError) {
        throw PaymentErrorHandler.handleStripeError(confirmError)
      }

      // Step 4: Handle success
      setProgress(100)

      if (paymentIntent?.status === "succeeded") {
        paymentService.clearRetryAttempts(paymentIntent.id)
        toast.success("Thanh toán thành công!")
        onSuccess()
      } else if (paymentIntent?.status === "requires_action") {
        setError({
          code: "REQUIRES_ACTION",
          message: "Thanh toán cần xác thực thêm",
          type: "card_error",
          retryable: false,
          suggestions: ["Làm theo hướng dẫn từ ngân hàng"],
        })
      } else {
        throw new Error("Unexpected payment status: " + paymentIntent?.status)
      }
    } catch (err: any) {
      console.error("Payment error:", err)

      const paymentError = err.code ? err : PaymentErrorHandler.handleStripeError(err)
      setError(paymentError)
      onError(paymentError.message)

      if (paymentError.retryable) {
        toast.error(`${paymentError.message}. Có thể thử lại.`)
      } else {
        toast.error(paymentError.message)
      }
    } finally {
      clearInterval(progressInterval)
      setIsLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  // Get card brand icon
  const getCardIcon = (brand: string) => {
    switch (brand) {
      case "visa":
        return "💳"
      case "mastercard":
        return "💳"
      case "amex":
        return "💳"
      default:
        return "💳"
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Thông tin thanh toán
          <div className="ml-auto flex items-center gap-2">
            {isOnline ? (
              <Badge variant="secondary" className="bg-green-600">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Badge variant="outline" className="text-gray-300">
              <Shield className="w-3 h-3 mr-1" />
              Bảo mật
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        {isLoading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Đang xử lý thanh toán...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{error.message}</p>
                {error.suggestions && (
                  <div className="text-sm">
                    <p className="font-medium">Gợi ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {error.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {error.retryable && (
                  <Button variant="outline" size="sm" onClick={handleRetry} disabled={isLoading} className="mt-2">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Thử lại ({retryCount}/{3})
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Payment form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
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

            {/* Card brand indicator */}
            {cardBrand && <div className="absolute top-2 right-2 text-2xl">{getCardIcon(cardBrand)}</div>}
          </div>

          {/* Security notice */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Lock className="w-4 h-4" />
            <span>Thông tin thẻ được mã hóa và bảo mật</span>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={!stripe || isLoading || !cardComplete || !isOnline}
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

          {/* Retry information */}
          {retryCount > 0 && <div className="text-sm text-gray-400 text-center">Lần thử thứ {retryCount + 1}/3</div>}
        </form>
      </CardContent>
    </Card>
  )
}

interface EnhancedStripePaymentProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

export default function EnhancedStripePayment({ amount, onSuccess, onError }: EnhancedStripePaymentProps) {
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    if (!publishableKey) {
      setStripeError("Hệ thống thanh toán chưa được cấu hình")
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
