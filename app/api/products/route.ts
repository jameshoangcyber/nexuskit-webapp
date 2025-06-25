import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { type Product, transformProduct } from "@/lib/models/Product"

export async function GET(request: NextRequest) {
  try {
    console.log("Products API called")

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "name"
    const sortOrder = searchParams.get("sortOrder") || "asc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    console.log("Search params:", { search, category, minPrice, maxPrice, sortBy, sortOrder, page, limit })

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Build filter query
    const filter: any = { isActive: true }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    if (category && category !== "" && category !== "all") {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseInt(maxPrice)
    }

    console.log("MongoDB filter:", filter)

    // Build sort query
    const sort: any = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query with pagination
    const skip = (page - 1) * limit
    const [products, total] = await Promise.all([
      productsCollection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      productsCollection.countDocuments(filter),
    ])

    console.log(`Found ${products.length} products out of ${total} total`)

    const transformedProducts = products.map(transformProduct)

    const response = {
      products: transformedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }

    console.log("Returning response:", {
      productCount: response.products.length,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Products API error:", error)

    // Return empty but valid response instead of error
    return NextResponse.json(
      {
        products: [],
        total: 0,
        page: 1,
        totalPages: 0,
        error: "Database connection failed",
      },
      { status: 200 },
    ) // Return 200 instead of 500 to prevent client-side errors
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new product")

    const body = await request.json()
    console.log("Product data:", body)

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    const newProduct: Product = {
      name: body.name,
      description: body.description,
      price: body.price,
      images: body.images || [body.image || "/placeholder.svg?height=400&width=400"],
      category: body.category || "electronics",
      specifications: body.specifications || {},
      stock: body.stock || 100,
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await productsCollection.insertOne(newProduct)
    newProduct._id = result.insertedId

    console.log("Product created with ID:", result.insertedId)

    return NextResponse.json(transformProduct(newProduct), { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
