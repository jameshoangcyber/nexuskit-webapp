import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { getDatabase } from "@/lib/mongodb"
import { type User, transformUser } from "@/lib/models/User"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 })
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key")
    } catch (jwtError) {
      // Token is invalid, clear it
      const response = NextResponse.json({ error: "Invalid token, please login again" }, { status: 401 })
      response.cookies.delete("token")
      return response
    }

    // Get fresh user data
    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")
    const user = await usersCollection.findOne({ _id: new ObjectId(decoded.userId) })

    if (!user) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 })
      response.cookies.delete("token")
      return response
    }

    // Create new token
    const newToken = jwt.sign(
      {
        userId: user._id?.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "fallback-secret-key",
      { expiresIn: "7d" },
    )

    const response = NextResponse.json({
      message: "Token refreshed successfully",
      user: transformUser(user),
    })

    response.cookies.set("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error("Refresh token error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
