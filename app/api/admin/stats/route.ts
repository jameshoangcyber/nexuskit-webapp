import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()

    // Get statistics
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      db.collection("products").countDocuments({ isActive: true }),
      db.collection("orders").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("orders").find().toArray(),
    ])

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

    // Get recent orders
    const recentOrders = await db.collection("orders").find().sort({ createdAt: -1 }).limit(5).toArray()

    // Get top products
    const topProducts = await db
      .collection("products")
      .find({ isActive: true })
      .sort({ totalReviews: -1 })
      .limit(5)
      .toArray()

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
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
