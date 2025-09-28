import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    const response = {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + "..." : null,
      jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
      secretLength: process.env.JWT_SECRET?.length || 0,
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key")
        response.tokenValid = true
        response.decoded = decoded
      } catch (jwtError) {
        response.tokenValid = false
        response.jwtError = jwtError.message
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
