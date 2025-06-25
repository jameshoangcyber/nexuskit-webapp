import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { type Order, transformOrder } from "@/lib/models/Order"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await getDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const filter: any = { _id: new ObjectId(params.id) }

    // If not admin, only show user's orders
    if (decoded.role !== "admin") {
      filter.userId = decoded.userId
    }

    const order = await ordersCollection.findOne(filter)

    if (!order) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 })
    }

    return NextResponse.json(transformOrder(order))
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const db = await getDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 })
    }

    return NextResponse.json(transformOrder(result))
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
