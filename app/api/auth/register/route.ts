import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getDatabase } from "@/lib/mongodb"
import { type User, transformUser } from "@/lib/models/User"

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const newUser: User = {
      name,
      email,
      password: hashedPassword,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)
    newUser._id = result.insertedId

    // Generate simple token (for testing)
    const token = `user_${newUser._id.toString()}_${Date.now()}`

    // Transform user data
    const userResponse = transformUser(newUser)

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
    console.error("Register error:", error)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}
