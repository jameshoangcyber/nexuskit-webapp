import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { type Product, transformProduct } from "@/lib/models/Product"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search")

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Build filter query
    const filter: any = {}
    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    // Execute query with pagination
    const skip = (page - 1) * limit
    const [products, total] = await Promise.all([
      productsCollection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      productsCollection.countDocuments(filter),
    ])

    const transformedProducts = products.map(transformProduct)

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Admin products GET error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const newProduct: Product = {
      name: body.name,
      description: body.description,
      price: body.price,
      images: body.images || [body.image || "/placeholder.svg?height=400&width=400"],
      category: body.category,
      specifications: body.specifications || {},
      stock: body.stock || 0,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await productsCollection.insertOne(newProduct)
    newProduct._id = result.insertedId

    return NextResponse.json(transformProduct(newProduct), { status: 201 })
  } catch (error) {
    console.error("Admin products POST error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
