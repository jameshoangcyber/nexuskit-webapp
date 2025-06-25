"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import toast from "react-hot-toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...")

interface PaymentFormProps {
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
}

function PaymentForm({ amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    try {
      // Create payment intent
      const { clientSecret } = await api.createPaymentIntent(amount)

      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error("Card element not found")
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      })

      if (error) {
        onError(error.message || "Lỗi thanh toán")
      } else if (paymentIntent.status === "succeeded") {
        onSuccess()
        toast.success("Thanh toán thành công!")
      }
    } catch (error) {
      onError("Lỗi khi xử lý thanh toán")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Thông tin thẻ</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-600 rounded-lg bg-gray-700">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#ffffff",
                    "::placeholder": {
                      color: "#9ca3af",
                    },
                  },
                },
              }}
            />
          </div>
          <Button type="submit" disabled={!stripe || isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
            {isLoading
              ? "Đang xử lý..."
              : `Thanh toán ${new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(amount)}`}
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
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm amount={amount} onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
