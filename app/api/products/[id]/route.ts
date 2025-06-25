import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { type Product, transformProduct } from "@/lib/models/Product"
import { ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    const product = await productsCollection.findOne({
      _id: new ObjectId(params.id),
      isActive: true,
    })

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 })
    }

    return NextResponse.json(transformProduct(product))
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin role
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
    const productsCollection = db.collection<Product>("products")

    const updateData = {
      ...body,
      updatedAt: new Date(),
    }

    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 })
    }

    return NextResponse.json(transformProduct(result))
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin role
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Soft delete - set isActive to false
    const result = await productsCollection.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: { isActive: false, updatedAt: new Date() } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 })
    }

    return NextResponse.json({ message: "Xóa sản phẩm thành công" })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
