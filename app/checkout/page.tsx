"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Image from "next/image"
import StripePayment from "@/components/payment/stripe-payment"
import { api } from "@/lib/api"

const checkoutSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  address: z.string().min(10, "Địa chỉ phải có ít nhất 10 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  paymentMethod: z.string(),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { cart, getCartTotal, isAuthenticated, user, clearCart, addOrder } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [showStripePayment, setShowStripePayment] = useState(false)

  const handlePaymentSuccess = () => {
    // Handle successful payment
    handleSubmit(form.getValues())
  }

  const handlePaymentError = (error: string) => {
    toast.error(error)
  }

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      paymentMethod: "cod",
    },
  })

  useEffect(() => {
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

  const handleSubmit = async (data: CheckoutForm) => {
    setIsLoading(true)

    try {
      // Create order via API
      const orderData = {
        items: cart,
        total: getCartTotal(),
        paymentMethod: data.paymentMethod,
        shippingInfo: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          email: data.email,
        },
      }

      const response = await api.createOrder(orderData)
      clearCart()

      toast.success("Đặt hàng thành công!")
      router.push("/dashboard")
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated() || cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold text-white mb-8">Thanh toán</h1>
        </motion.div>

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
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Họ tên
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
                      Số điện thoại
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

                  <div>
                    <Label htmlFor="email" className="text-gray-300">
                      Email
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
                      Địa chỉ giao hàng
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

                  <div>
                    <Label className="text-gray-300 mb-3 block">Phương thức thanh toán</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => {
                        setPaymentMethod(value)
                        form.setValue("paymentMethod", value)
                        setShowStripePayment(value === "stripe")
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="text-gray-300">
                          Thanh toán khi nhận hàng (COD)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="stripe" id="stripe" />
                        <Label htmlFor="stripe" className="text-gray-300">
                          Thanh toán bằng thẻ (Stripe)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="text-gray-300">
                          Chuyển khoản ngân hàng
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {showStripePayment && (
                    <div className="mt-6">
                      <StripePayment
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        amount={getCartTotal() * 100}
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || paymentMethod === "stripe"}
                    className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                    size="lg"
                  >
                    {isLoading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                  </Button>
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
                <CardTitle className="text-white">Tóm tắt đơn hàng</CardTitle>
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

                <div className="border-t border-gray-700 mt-6 pt-6 space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Thuế VAT:</span>
                    <span>Đã bao gồm</span>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-400">{formatPrice(getCartTotal())}</span>
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
