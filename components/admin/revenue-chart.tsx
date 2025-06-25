"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"

interface RevenueChartProps {
  data: Array<{
    _id: { year: number; month: number }
    revenue: number
    orders: number
  }>
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  const getMonthName = (month: number) => {
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ]
    return months[month - 1]
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Doanh thu 6 tháng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">
                  {getMonthName(item._id.month)} {item._id.year}
                </span>
                <div className="text-right">
                  <div className="text-white font-medium">{formatPrice(item.revenue)}</div>
                  <div className="text-gray-400 text-xs">{item.orders} đơn hàng</div>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
