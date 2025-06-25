import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  role: "user" | "admin"
  phone?: string
  address?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserResponse {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  phone?: string
  address?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export function transformUser(user: User): UserResponse {
  return {
    id: user._id?.toString() || "",
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
    avatar: user.avatar,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
