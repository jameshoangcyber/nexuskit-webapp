"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ShoppingCart, Star, Heart, Package, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"
import ProductFilters from "@/components/products/product-filters"
import { api } from "@/lib/api"
import { useState, useEffect, useCallback } from "react"
import { mockProducts } from "@/lib/mock-data"
import { useRouter, useSearchParams } from "next/navigation"

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    productsPerPage: 9,
    hasNextPage: false,
    hasPrevPage: false,
  })

  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchProducts = useCallback(
    async (filters = {}) => {
      setIsLoading(true)
      setError("")

      try {
        console.log("Fetching products with filters:", filters)

        // Get page from URL or default to 1
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = 9

        const queryParams = {
          ...filters,
          page,
          limit,
        }

        // Try API first, fallback to mock data with pagination
        const response = await api.getProducts(queryParams).catch((apiError) => {
          console.log("API failed, using mock data:", apiError)

          // Simulate pagination with mock data
          const startIndex = (page - 1) * limit
          const endIndex = startIndex + limit

          const filteredProducts = mockProducts.filter((product) => {
            if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase())) {
              return false
            }
            if (filters.category && product.category !== filters.category) {
              return false
            }
            if (filters.minPrice && product.price < Number.parseInt(filters.minPrice)) {
              return false
            }
            if (filters.maxPrice && product.price > Number.parseInt(filters.maxPrice)) {
              return false
            }
            return true
          })

          const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

          return {
            products: paginatedProducts.map((product) => ({
              ...product,
              image: product.image || "/placeholder.svg?height=400&width=400",
            })),
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(filteredProducts.length / limit),
              totalProducts: filteredProducts.length,
              productsPerPage: limit,
              hasNextPage: endIndex < filteredProducts.length,
              hasPrevPage: page > 1,
            },
          }
        })

        console.log("Products response:", response)

        const productsData = response.products || response || []
        setProducts(productsData)

        // Update pagination state
        if (response.pagination) {
          setPagination(response.pagination)
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setError("Không thể tải danh sách sản phẩm")

        // Fallback to mock data on error
        const page = Number.parseInt(searchParams.get("page") || "1")
        const limit = 9
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedMockProducts = mockProducts.slice(startIndex, endIndex)

        setProducts(
          paginatedMockProducts.map((product) => ({
            ...product,
            image: product.image || "/placeholder.svg?height=400&width=400",
          })),
        )

        setPagination({
          currentPage: page,
          totalPages: Math.ceil(mockProducts.length / limit),
          totalProducts: mockProducts.length,
          productsPerPage: limit,
          hasNextPage: endIndex < mockProducts.length,
          hasPrevPage: page > 1,
        })
      } finally {
        setIsLoading(false)
      }
    },
    [searchParams],
  )

  // Initial load
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFiltersChange = useCallback(
    (newFilters: any) => {
      console.log("Filters changed:", newFilters)

      // Update URL without page parameter (reset to page 1)
      const params = new URLSearchParams()
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.set(key, value.toString())
        }
      })

      router.push(`/products?${params.toString()}`, { scroll: false })

      // Fetch with new filters
      fetchProducts(newFilters)
    },
    [router, fetchProducts],
  )

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`/products?${params.toString()}`, { scroll: false })
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Sản phẩm NexusKit</h1>
          <p className="text-xl text-gray-400">Khám phá bộ sưu tập sản phẩm công nghệ tiên tiến</p>

          {/* Product Count Summary */}
          {!isLoading && (
            <div className="mt-4 text-gray-400">
              Hiển thị {(pagination.currentPage - 1) * pagination.productsPerPage + 1}-
              {Math.min(pagination.currentPage * pagination.productsPerPage, pagination.totalProducts)} trong tổng số{" "}
              {pagination.totalProducts} sản phẩm
            </div>
          )}
        </motion.div>

        {/* Categories Overview Link */}
        <div className="mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Duyệt theo danh mục</h2>
                  <p className="text-gray-400">Khám phá sản phẩm theo từng danh mục chuyên biệt</p>
                </div>
                <Link href="/products/categories">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Package className="w-4 h-4 mr-2" />
                    Xem tất cả danh mục
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-center">{error}</p>
            <div className="text-center mt-2">
              <Button onClick={() => fetchProducts()} variant="outline" className="border-red-500 text-red-400">
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="mb-6 flex justify-between items-center">
            <Button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Trang trước
            </Button>

            <div className="text-gray-400">
              Trang {pagination.currentPage} / {pagination.totalPages}
            </div>

            <Button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Trang sau
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(9)].map((_, index) => (
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
              <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-400 mb-6">
                Không có sản phẩm nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc.
              </p>
              <div className="space-y-2">
                <Button onClick={() => handleFiltersChange({})} className="bg-blue-600 hover:bg-blue-700">
                  Xóa bộ lọc
                </Button>
                <br />
                <Link href="/">
                  <Button variant="outline" className="border-gray-600 text-gray-300">
                    Về trang chủ
                  </Button>
                </Link>
              </div>
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
      </div>
    </div>
  )
}
