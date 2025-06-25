import type { ObjectId } from "mongodb"

export interface Review {
  _id?: ObjectId
  userId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Product {
  _id?: ObjectId
  name: string
  description: string
  price: number
  images: string[]
  category: string
  specifications: Record<string, string>
  stock: number
  reviews: Review[]
  averageRating: number
  totalReviews: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductResponse {
  id: string
  name: string
  description: string
  price: number
  image: string
  images: string[]
  category: string
  specifications: Record<string, string>
  stock: number
  reviews: Array<{
    id: string
    user: string
    rating: number
    comment: string
    date: string
  }>
  averageRating: number
  totalReviews: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function transformProduct(product: Product): ProductResponse {
  return {
    id: product._id?.toString() || "",
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.images[0] || "/placeholder.svg?height=400&width=400",
    images: product.images,
    category: product.category,
    specifications: product.specifications,
    stock: product.stock,
    reviews: product.reviews.map((review) => ({
      id: review._id?.toString() || "",
      user: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.createdAt.toISOString().split("T")[0],
    })),
    averageRating: product.averageRating,
    totalReviews: product.totalReviews,
    isActive: product.isActive,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
