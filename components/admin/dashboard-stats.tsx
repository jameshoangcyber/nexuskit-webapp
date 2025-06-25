"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface DashboardStatsProps {
  stats: {
    totalProducts: number
    totalOrders: number
    totalUsers: number
    totalRevenue: number
    monthlyRevenue: Array<{
      _id: { year: number; month: number }
      revenue: number
      orders: number
    }>
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const [previousRevenue, setPreviousRevenue] = useState(0)
  const [revenueGrowth, setRevenueGrowth] = useState(0)

  useEffect(() => {
    if (stats.monthlyRevenue.length >= 2) {
      const currentMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 1]
      const previousMonth = stats.monthlyRevenue[stats.monthlyRevenue.length - 2]

      const growth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
      setRevenueGrowth(growth)
      setPreviousRevenue(previousMonth.revenue)
    }
  }, [stats.monthlyRevenue])

  const statsCards = [
    {
      title: "Tổng sản phẩm",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Tổng đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Tổng khách hàng",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Tổng doanh thu",
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      growth: revenueGrowth,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">
                    {typeof stat.value === "string" ? stat.value : stat.value.toLocaleString()}
                  </p>
                  {stat.growth !== undefined && (
                    <div className="flex items-center space-x-1">
                      {stat.growth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm font-medium ${stat.growth >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {stat.growth >= 0 ? "+" : ""}
                        {stat.growth.toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm">so với tháng trước</span>
                    </div>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
