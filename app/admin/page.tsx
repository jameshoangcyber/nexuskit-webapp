"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { TrendingUp, Eye, Edit, Trash2, Plus } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { api } from "@/lib/api"
import toast from "react-hot-toast"
import Link from "next/link"
import DashboardStats from "@/components/admin/dashboard-stats"
import RevenueChart from "@/components/admin/revenue-chart"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: [],
  })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch("/api/admin/stats").then((res) => res.json()),
        api.getProducts({ limit: 10 }),
        api.getOrders(),
      ])

      setStats(statsRes)
      setProducts(productsRes.products || [])
      setOrders(ordersRes || [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Lỗi khi tải dữ liệu dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return

    try {
      await api.deleteProduct(id)
      toast.success("Xóa sản phẩm thành công")
      fetchDashboardData()
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm")
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>
        </motion.div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStats stats={stats} />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <RevenueChart data={stats.monthlyRevenue} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Đơn hàng gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.slice(0, 5).map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">#{order._id.slice(-6)}</p>
                        <p className="text-gray-400 text-sm">{order.shippingInfo?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-medium">{formatPrice(order.total)}</p>
                        <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="products" className="text-gray-300 data-[state=active]:text-white">
                Quản lý sản phẩm
              </TabsTrigger>
              <TabsTrigger value="orders" className="text-gray-300 data-[state=active]:text-white">
                Quản lý đơn hàng
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Danh sách sản phẩm</CardTitle>
                  <Link href="/admin/products/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm sản phẩm
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-gray-300 py-3">Tên sản phẩm</th>
                          <th className="text-left text-gray-300 py-3">Giá</th>
                          <th className="text-left text-gray-300 py-3">Danh mục</th>
                          <th className="text-left text-gray-300 py-3">Kho</th>
                          <th className="text-left text-gray-300 py-3">Đánh giá</th>
                          <th className="text-right text-gray-300 py-3">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: any) => (
                          <tr key={product.id} className="border-b border-gray-700">
                            <td className="py-4">
                              <div className="text-white font-medium">{product.name}</div>
                              <div className="text-gray-400 text-sm">{product.description?.substring(0, 50)}...</div>
                            </td>
                            <td className="py-4 text-blue-400 font-medium">{formatPrice(product.price)}</td>
                            <td className="py-4">
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {product.category}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <span className={`text-sm ${product.stock > 10 ? "text-green-400" : "text-red-400"}`}>
                                {product.stock} sản phẩm
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center">
                                <TrendingUp className="w-4 h-4 text-yellow-400 mr-1" />
                                <span className="text-gray-300">{product.totalReviews || 0}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/products/${product.id}`}>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/admin/products/${product.id}/edit`}>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Danh sách đơn hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border border-gray-700 rounded-lg p-4">
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

                        <div className="text-sm text-gray-400">
                          <p>
                            <strong>Khách hàng:</strong> {order.shippingInfo?.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {order.shippingInfo?.email}
                          </p>
                          <p>
                            <strong>Điện thoại:</strong> {order.shippingInfo?.phone}
                          </p>
                          <p>
                            <strong>Địa chỉ:</strong> {order.shippingInfo?.address}
                          </p>
                        </div>

                        <div className="mt-4">
                          <p className="text-gray-300 text-sm mb-2">Sản phẩm:</p>
                          <div className="space-y-1">
                            {order.items?.map((item: any) => (
                              <div key={item.product.id} className="text-gray-400 text-sm">
                                {item.product.name} x {item.quantity} ={" "}
                                {formatPrice(item.product.price * item.quantity)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
