"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useStore()

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
    if (newQuantity === 0) {
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng")
    }
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeFromCart(productId)
    toast.success(`Đã xóa ${productName} khỏi giỏ hàng`)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Giỏ hàng trống</h1>
            <p className="text-gray-400 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold text-white mb-8">Giỏ hàng của bạn</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-32 h-32 flex-shrink-0">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{item.product.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{item.product.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-bold text-blue-400">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.product.id, item.product.name)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="bg-gray-800 border-gray-700 sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-300">
                    <span>Tạm tính:</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Phí vận chuyển:</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between text-lg font-bold text-white">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-400">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href="/checkout" className="block">
                    <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                      Tiến hành thanh toán
                    </Button>
                  </Link>
                  <Link href="/products" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>

                <Button
                  variant="ghost"
                  onClick={clearCart}
                  className="w-full mt-4 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  Xóa tất cả
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
