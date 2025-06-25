"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Package, LogOut, ShoppingBag } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import ProfileForm from "@/components/user/profile-form"

export default function DashboardPage() {
  const { user, isAuthenticated, setUser } = useStore()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Vui lòng đăng nhập để truy cập")
      router.push("/auth")
      return
    }

    fetchUserData()
  }, [isAuthenticated, router])

  const fetchUserData = async () => {
    try {
      const [userRes, ordersRes] = await Promise.all([fetch("/api/auth/me").then((res) => res.json()), api.getOrders()])

      if (userRes.user) {
        setUser(userRes.user)
      }
      setOrders(ordersRes || [])
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast.error("Lỗi khi tải dữ liệu")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.logout()
      setUser(null)
      toast.success("Đăng xuất thành công")
      router.push("/")
    } catch (error) {
      toast.error("Lỗi khi đăng xuất")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "confirmed":
        return "bg-blue-500"
      case "shipped":
        return "bg-purple-500"
      case "delivered":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận"
      case "confirmed":
        return "Đã xác nhận"
      case "shipped":
        return "Đang giao"
      case "delivered":
        return "Đã giao"
      default:
        return "Không xác định"
    }
  }

  if (!isAuthenticated()) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Xin chào, {user?.name}!</h1>
            <p className="text-gray-400">Quản lý thông tin tài khoản và đơn hàng của bạn</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800 mt-4 sm:mt-0"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="orders" className="text-gray-300 data-[state=active]:text-white">
                Đơn hàng của tôi
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-gray-300 data-[state=active]:text-white">
                Thông tin cá nhân
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Đơn hàng của bạn ({orders.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">Bạn chưa có đơn hàng nào</p>
                      <Button onClick={() => router.push("/products")} className="bg-blue-600 hover:bg-blue-700">
                        Mua sắm ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order: any, index) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                            <div>
                              <h3 className="text-white font-medium">Đơn hàng #{order.id}</h3>
                              <p className="text-gray-400 text-sm">
                                {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                              <Badge className={`${getStatusColor(order.status)} text-white`}>
                                {getStatusText(order.status)}
                              </Badge>
                              <span className="text-blue-400 font-bold">{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div key={item.product.id} className="flex items-center space-x-3">
                                <div className="w-12 h-12 flex-shrink-0">
                                  <Image
                                    src={item.product.image || "/placeholder.svg"}
                                    alt={item.product.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover rounded"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm font-medium">{item.product.name}</p>
                                  <p className="text-gray-400 text-xs">Số lượng: {item.quantity}</p>
                                </div>
                                <span className="text-gray-300 text-sm">
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-sm text-gray-400">
                              <p>
                                <strong>Người nhận:</strong> {order.shippingInfo.name}
                              </p>
                              <p>
                                <strong>Địa chỉ:</strong> {order.shippingInfo.address}
                              </p>
                              <p>
                                <strong>Điện thoại:</strong> {order.shippingInfo.phone}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="mt-6">
              <ProfileForm />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
