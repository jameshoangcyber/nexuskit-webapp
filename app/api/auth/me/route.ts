import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import { type User, transformUser } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: transformUser(user) })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const body = await request.json()

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    const updateData = {
      name: body.name,
      phone: body.phone,
      address: body.address,
      updatedAt: new Date(),
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(decoded.userId) },
      { $set: updateData },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: transformUser(result) })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
