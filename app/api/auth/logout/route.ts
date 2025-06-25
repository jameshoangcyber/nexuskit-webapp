import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Đăng xuất thành công" })

  // Clear the token cookie
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
  })

  return response
}
