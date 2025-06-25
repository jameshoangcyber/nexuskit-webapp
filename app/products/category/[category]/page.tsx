"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star, Heart, ArrowLeft, Package } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"
import { mockProducts } from "@/lib/mock-data"
import { notFound } from "next/navigation"

interface CategoryPageProps {
  params: {
    category: string
  }
}

const categoryNames: Record<string, string> = {
  smartphone: "Smartphone",
  laptop: "Laptop",
  tablet: "Tablet",
  smartwatch: "Smartwatch",
  audio: "Audio & Headphones",
  gaming: "Gaming",
  smarthome: "Smart Home",
  accessories: "Phụ kiện",
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()

  const categoryName = categoryNames[params.category]

  if (!categoryName) {
    notFound()
  }

  useEffect(() => {
    fetchCategoryProducts()
  }, [params.category])

  const fetchCategoryProducts = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Try API first, fallback to mock data
      const response = await api.getProducts({ category: params.category }).catch((apiError) => {
        console.log("API failed, using mock data:", apiError)
        const filteredMockProducts = mockProducts.filter((product) => product.category === params.category)
        return {
          products: filteredMockProducts.map((product) => ({
            ...product,
            image: product.image || "/placeholder.svg?height=400&width=400",
          })),
          total: filteredMockProducts.length,
        }
      })

      const productsData = response.products || response || []
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching category products:", error)
      setError("Không thể tải danh sách sản phẩm")
      // Fallback to mock data on error
      const filteredMockProducts = mockProducts.filter((product) => product.category === params.category)
      setProducts(
        filteredMockProducts.map((product) => ({
          ...product,
          image: product.image || "/placeholder.svg?height=400&width=400",
        })),
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const handleWishlistToggle = (product: any) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success(`Đã xóa ${product.name} khỏi danh sách yêu thích`)
    } else {
      addToWishlist(product)
      toast.success(`Đã thêm ${product.name} vào danh sách yêu thích`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="inline-flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tất cả sản phẩm
          </Link>
          <span className="text-gray-600">•</span>
          <Link href="/products/categories" className="inline-flex items-center text-gray-400 hover:text-white">
            <Package className="w-4 h-4 mr-2" />
            Danh mục sản phẩm
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-blue-600 text-lg px-4 py-2">{categoryName}</Badge>
          <h1 className="text-4xl font-bold text-white mb-4">Danh mục {categoryName}</h1>
          <p className="text-xl text-gray-400">Khám phá bộ sưu tập {categoryName.toLowerCase()} chất lượng cao</p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
            <div className="text-center mt-2">
              <Button onClick={fetchCategoryProducts} variant="outline" className="border-red-500 text-red-400">
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                <div className="w-full h-64 bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Không có sản phẩm</h3>
              <p className="text-gray-400 mb-6">Hiện tại chưa có sản phẩm nào trong danh mục {categoryName}.</p>
              <Link href="/products">
                <Button className="bg-blue-600 hover:bg-blue-700">Xem tất cả sản phẩm</Button>
              </Link>
            </div>
          </div>
        ) : (
          // Products Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg?height=400&width=400"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <Button
                      onClick={() => handleWishlistToggle(product)}
                      className={`absolute top-2 right-2 p-2 ${
                        isInWishlist(product.id) ? "bg-red-600 hover:bg-red-700" : "bg-gray-800/80 hover:bg-gray-700"
                      }`}
                      size="sm"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 flex-1 line-clamp-3">{product.description}</p>

                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.averageRating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm ml-2">
                        ({product.averageRating?.toFixed(1) || 0}) • {product.reviews?.length || 0} đánh giá
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-400">{formatPrice(product.price)}</span>
                      {product.stock !== undefined && (
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            product.stock > 10
                              ? "bg-green-900/20 text-green-400"
                              : product.stock > 0
                                ? "bg-yellow-900/20 text-yellow-400"
                                : "bg-red-900/20 text-red-400"
                          }`}
                        >
                          {product.stock > 10 ? "Còn hàng" : product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Category Stats */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400">
              Hiển thị {products.length} sản phẩm trong danh mục {categoryName}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
