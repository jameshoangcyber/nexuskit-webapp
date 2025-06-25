import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/mongodb"
import { type User, transformUser } from "@/lib/models/User"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user by email
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 })
    }

    // Generate simple token (for testing - in production use proper JWT)
    const token = `user_${user._id?.toString()}_${Date.now()}`

    // Transform user data
    const userResponse = transformUser(user)

    const response = NextResponse.json({
      user: userResponse,
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
