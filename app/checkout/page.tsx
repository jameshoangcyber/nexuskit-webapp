"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import EnhancedStripePayment from "@/components/payment/enhanced-stripe-payment"
import { api } from "@/lib/api"
import {
  AlertCircle,
  Loader2,
  CreditCard,
  Truck,
  Building,
  Smartphone,
  Shield,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react"

const checkoutSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  paymentMethod: z.string(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

// Payment method configurations
const paymentMethods = [
  {
    id: "stripe",
    name: "Thẻ tín dụng/ghi nợ",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    badge: "Bảo mật",
    badgeColor: "bg-green-600",
    processingTime: "Ngay lập tức",
    fees: "Miễn phí",
  },
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    icon: Truck,
    badge: "Phổ biến",
    badgeColor: "bg-blue-600",
    processingTime: "1-3 ngày làm việc",
    fees: "Miễn phí",
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua Internet Banking",
    icon: Building,
    badge: "Tiết kiệm",
    badgeColor: "bg-purple-600",
    processingTime: "1-2 ngày làm việc",
    fees: "Miễn phí",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    icon: Smartphone,
    badge: "Nhanh chóng",
    badgeColor: "bg-pink-600",
    processingTime: "Ngay lập tức",
    fees: "Miễn phí",
  },
]

export default function CheckoutPage() {
  const { cart, getCartTotal, isAuthenticated, user, clearCart } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [systemError, setSystemError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("stripe")
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      paymentMethod: "stripe",
    },
  })

  useEffect(() => {
    // System health check
    const checkSystemHealth = async () => {
      try {
        const response = await fetch("/api/payment/health")
        if (!response.ok) {
          setSystemError("Hệ thống thanh toán đang bảo trì. Vui lòng thử lại sau.")
        }
      } catch (error) {
        console.error("Health check failed:", error)
      }
    }

    checkSystemHealth()

    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để tiếp tục")
      router.push("/auth")
      return
    }

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống")
      router.push("/cart")
      return
    }
  }, [isAuthenticated, cart, router])

  const handlePaymentSuccess = async () => {
    try {
      await handleSubmit(form.getValues())
    } catch (error: any) {
      toast.error("Lỗi sau khi thanh toán: " + error.message)
    }
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    toast.error(error)
  }

  const handleSubmit = async (data: CheckoutForm) => {
    setIsLoading(true)
    setPaymentError(null)

    try {
      // Validate cart
      if (cart.length === 0) {
        throw new Error("Giỏ hàng trống")
      }

      const total = getCartTotal()
      if (total <= 0) {
        throw new Error("Tổng tiền không hợp lệ")
      }

      // Create order
      const orderData = {
        items: cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "stripe" ? "paid" : "pending",
        shippingInfo: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: data.email,
        },
        notes: `Đặt hàng qua website - ${paymentMethods.find((m) => m.id === data.paymentMethod)?.name}`,
      }

      const response = await api.createOrder(orderData)

      setOrderSuccess(true)
      clearCart()
      toast.success("Đặt hàng thành công!")

      // Redirect after success
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Order creation error:", error)
      const errorMessage = error.message || "Có lỗi xảy ra, vui lòng thử lại"
      setPaymentError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated() || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Đặt hàng thành công!</h2>
            <p className="text-gray-400 mb-4">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng trong thời gian sớm nhất.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Xem đơn hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold text-white mb-8">Thanh toán</h1>
        </motion.div>

        {systemError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{systemError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{paymentError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">
                        Họ tên *
                      </Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Nguyễn Văn A"
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-400 text-sm mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-300">
                        Số điện thoại *
                      </Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="0123456789"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="your@email.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-gray-300">
                      Địa chỉ giao hàng *
                    </Label>
                    <Input
                      id="address"
                      {...form.register("address")}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    />
                    {form.formState.errors.address && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.address.message}</p>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Payment Methods */}
                  <div>
                    <Label className="text-gray-300 mb-4 block text-lg font-semibold">Phương thức thanh toán</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => {
                        setPaymentMethod(value)
                        form.setValue("paymentMethod", value)
                        setShowPaymentForm(value === "stripe")
                        setPaymentError(null)
                      }}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <div
                            key={method.id}
                            className={`relative p-4 border rounded-lg transition-all ${
                              paymentMethod === method.id
                                ? "border-blue-500 bg-blue-500/10"
                                : "border-gray-600 hover:border-gray-500"
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                              <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Label htmlFor={method.id} className="text-white font-medium cursor-pointer">
                                    {method.name}
                                  </Label>
                                  <Badge className={`${method.badgeColor} text-white text-xs`}>{method.badge}</Badge>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{method.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {method.processingTime}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {method.fees}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </div>

                  {/* Stripe Payment Form */}
                  {showPaymentForm && !systemError && (
                    <div className="mt-6">
                      <EnhancedStripePayment
                        amount={getCartTotal()}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  {paymentMethod !== "stripe" && (
                    <Button
                      type="submit"
                      disabled={isLoading || !!systemError}
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
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
                          Xác nhận đặt hàng
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Tóm tắt đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{item.product.name}</h4>
                        <p className="text-gray-400 text-sm">Số lượng: {item.quantity}</p>
                      </div>
                      <div className="text-blue-400 font-medium">{formatPrice(item.product.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-400">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Thuế VAT:</span>
                    <span>Đã bao gồm</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-white">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-400">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>

                {/* Security badges */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      <span>Bảo mật SSL</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Đảm bảo hoàn tiền</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
