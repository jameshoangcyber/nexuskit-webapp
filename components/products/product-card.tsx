"use client"

import { useState } from "react"
import { Heart, ShoppingCart, Star, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  averageRating?: number
  stock?: number
  description: string
  specifications: Record<string, any>
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [isInCompare, setIsInCompare] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`)
  }

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success("Đã xóa khỏi danh sách yêu thích")
    } else {
      addToWishlist(product)
      toast.success("Đã thêm vào danh sách yêu thích")
    }
  }

  const handleAddToCompare = () => {
    const saved = localStorage.getItem("compareProducts")
    let compareProducts = []

    try {
      compareProducts = saved ? JSON.parse(saved) : []
    } catch (error) {
      compareProducts = []
    }

    if (compareProducts.length >= 4) {
      toast.error("Chỉ có thể so sánh tối đa 4 sản phẩm")
      return
    }

    if (compareProducts.find((p: Product) => p.id === product.id)) {
      toast.error("Sản phẩm đã được thêm vào so sánh")
      return
    }

    compareProducts.push(product)
    localStorage.setItem("compareProducts", JSON.stringify(compareProducts))
    setIsInCompare(true)
    toast.success(`Đã thêm ${product.name} vào so sánh`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
          />
        ))}
        <span className="text-xs text-gray-400">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-300 group">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.image || "/placeholder.svg?height=200&width=200"}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-white"}`} />
          </Button>
        </div>

        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>

          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-white line-clamp-2 hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-gray-400 text-sm line-clamp-2">{product.description}</p>

          {product.averageRating && renderStars(product.averageRating)}

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-400">{formatPrice(product.price)}</span>
            {product.stock !== undefined && (
              <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
              </Badge>
            )}
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm vào giỏ
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddToCompare}
              disabled={isInCompare}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              title="Thêm vào so sánh"
            >
              {isInCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
