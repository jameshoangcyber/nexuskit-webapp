import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()

    // Get statistics with error handling
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      db
        .collection("products")
        .countDocuments({ isActive: true })
        .catch(() => 0),
      db
        .collection("orders")
        .countDocuments()
        .catch(() => 0),
      db
        .collection("users")
        .countDocuments()
        .catch(() => 0),
      db
        .collection("orders")
        .find()
        .toArray()
        .catch(() => []),
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Get recent orders
    const recentOrders = await db
      .collection("orders")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()
      .catch(() => [])

    // Get top products
    const topProducts = await db
      .collection("products")
      .find({ isActive: true })
      .sort({ totalReviews: -1 })
      .limit(5)
      .toArray()
      .catch(() => [])

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyRevenue = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ])
      .toArray()
      .catch(() => [])

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      topProducts,
      monthlyRevenue,
    })
  } catch (error) {
    console.error("Get stats error:", error)
    // Return default values instead of error
    return NextResponse.json({
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      recentOrders: [],
      topProducts: [],
      monthlyRevenue: [],
    })
  }
}
