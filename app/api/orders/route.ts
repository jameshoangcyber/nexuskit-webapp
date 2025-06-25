import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { type Order, transformOrder } from "@/lib/models/Order"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await getDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const filter: any = {}

    // If not admin, only show user's orders
    if (decoded.role !== "admin") {
      filter.userId = decoded.userId
    }

    const orders = await ordersCollection.find(filter).sort({ createdAt: -1 }).toArray()

    const transformedOrders = orders.map(transformOrder)

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error("Get orders error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const body = await request.json()

    const db = await getDatabase()
    const ordersCollection = db.collection<Order>("orders")

    const newOrder: Order = {
      userId: decoded.userId,
      items: body.items.map((item: any) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total: body.total,
      status: "pending",
      paymentMethod: body.paymentMethod || "cod",
      paymentStatus: body.paymentMethod === "stripe" ? "paid" : "pending",
      stripePaymentIntentId: body.stripePaymentIntentId,
      shippingInfo: body.shippingInfo,
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await ordersCollection.insertOne(newOrder)
    newOrder._id = result.insertedId

    return NextResponse.json(transformOrder(newOrder), { status: 201 })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
