"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star } from "lucide-react"
import toast from "react-hot-toast"
import ProductFilters from "@/components/products/product-filters"
import { api } from "@/lib/api"
import { useState, useEffect } from "react"
import { mockProducts } from "@/lib/mock-data"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({})
  const { addToCart } = useStore()

  const fetchProducts = async (newFilters = {}) => {
    setIsLoading(true)
    try {
      // Use mock data if API fails
      const response = await api.getProducts(newFilters).catch(() => {
        console.log("API failed, using mock data")
        return { products: mockProducts, total: mockProducts.length }
      })
      setProducts(response.products || mockProducts)
    } catch (error) {
      console.error("Error fetching products:", error)
      // Fallback to mock data
      setProducts(mockProducts)
      toast.error("Đang sử dụng dữ liệu mẫu")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    fetchProducts(newFilters)
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Sản phẩm NexusKit</h1>
          <p className="text-xl text-gray-400">Khám phá bộ sưu tập sản phẩm công nghệ tiên tiến</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-8">
          <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
        </div>

        {/* Products Grid */}
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
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product: any, index) => (
              // Keep the existing product card JSX here
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold text-white mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 flex-1">{product.description}</p>

                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-gray-400 text-sm ml-2">({product.reviews?.length || 0} đánh giá)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-400">{formatPrice(product.price)}</span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                          Xem chi tiết
                        </Button>
                      </Link>
                      <Button onClick={() => handleAddToCart(product)} className="bg-blue-600 hover:bg-blue-700">
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
