"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ProductComparison from "@/components/products/product-comparison"
import { mockProducts } from "@/lib/mock-data"
import Link from "next/link"
import Image from "next/image"
import { formatPrice } from "@/lib/utils"
import toast from "react-hot-toast"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  specifications: Record<string, any>
  averageRating: number
  stock: number
  description: string
}

export default function ComparePage() {
  const [compareProducts, setCompareProducts] = useState<Product[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    // Load all products
    setAllProducts(mockProducts)

    // Load saved comparison from localStorage
    const saved = localStorage.getItem("compareProducts")
    if (saved) {
      try {
        const savedProducts = JSON.parse(saved)
        setCompareProducts(savedProducts)
      } catch (error) {
        console.error("Error loading saved comparison:", error)
      }
    }
  }, [])

  useEffect(() => {
    // Save comparison to localStorage
    if (compareProducts.length > 0) {
      localStorage.setItem("compareProducts", JSON.stringify(compareProducts))
    }
  }, [compareProducts])

  useEffect(() => {
    const searchProducts = () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)

      // Simulate API delay
      setTimeout(() => {
        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        setSearchResults(filtered)
        setIsSearching(false)
      }, 300)
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, allProducts])

  const addToComparison = (product: Product) => {
    if (compareProducts.length >= 4) {
      toast.error("Chỉ có thể so sánh tối đa 4 sản phẩm")
      return
    }

    if (compareProducts.find((p) => p.id === product.id)) {
      toast.error("Sản phẩm đã được thêm vào so sánh")
      return
    }

    setCompareProducts((prev) => [...prev, product])
    toast.success(`Đã thêm ${product.name} vào so sánh`)
    setShowSearch(false)
    setSearchQuery("")
  }

  const removeFromComparison = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId))
    toast.success("Đã xóa sản phẩm khỏi so sánh")
  }

  const clearComparison = () => {
    setCompareProducts([])
    localStorage.removeItem("compareProducts")
    toast.success("Đã xóa tất cả sản phẩm khỏi so sánh")
  }

  const getPopularProducts = () => {
    return allProducts.slice(0, 6) // Get first 6 products as popular
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/products">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Quay lại sản phẩm
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-white">So sánh sản phẩm</h1>
            </div>

            <div className="flex items-center space-x-4">
              {compareProducts.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearComparison}
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Xóa tất cả
                </Button>
              )}
              <Button onClick={() => setShowSearch(!showSearch)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </div>
          </div>

          {/* Search Section */}
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Tìm kiếm sản phẩm để so sánh</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSearch(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  {isSearching && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-400 mt-2">Đang tìm kiếm...</p>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div>
                      <h3 className="text-white font-medium mb-3">Kết quả tìm kiếm ({searchResults.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Image
                                src={product.image || "/placeholder.svg?height=60&width=60"}
                                alt={product.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
                                <p className="text-blue-400 font-semibold">{formatPrice(product.price)}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {product.category}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addToComparison(product)}
                                disabled={
                                  compareProducts.length >= 4 ||
                                  compareProducts.find((p) => p.id === product.id) !== undefined
                                }
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery && !isSearching && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Không tìm thấy sản phẩm nào với từ khóa "{searchQuery}"</p>
                    </div>
                  )}

                  {!searchQuery && (
                    <div>
                      <h3 className="text-white font-medium mb-3">Sản phẩm phổ biến</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {getPopularProducts().map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Image
                                src={product.image || "/placeholder.svg?height=60&width=60"}
                                alt={product.name}
                                width={60}
                                height={60}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h3 className="font-medium text-white line-clamp-2">{product.name}</h3>
                                <p className="text-blue-400 font-semibold">{formatPrice(product.price)}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {product.category}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addToComparison(product)}
                                disabled={
                                  compareProducts.length >= 4 ||
                                  compareProducts.find((p) => p.id === product.id) !== undefined
                                }
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comparison Section */}
          <ProductComparison
            initialProducts={compareProducts}
            onRemoveProduct={removeFromComparison}
            onClearAll={clearComparison}
          />

          {/* Help Section */}
          {compareProducts.length === 0 && !showSearch && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="bg-gray-800 border-gray-700 mt-8">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Bắt đầu so sánh sản phẩm</h3>
                  <p className="text-gray-400 mb-6">
                    So sánh tính năng, giá cả và thông số kỹ thuật của các sản phẩm để đưa ra quyết định mua hàng tốt
                    nhất
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">1. Tìm kiếm sản phẩm</h4>
                      <p className="text-gray-400 text-sm">Sử dụng thanh tìm kiếm để tìm sản phẩm bạn muốn so sánh</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">2. Thêm vào so sánh</h4>
                      <p className="text-gray-400 text-sm">Thêm tối đa 4 sản phẩm để so sánh cùng lúc</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">3. So sánh chi tiết</h4>
                      <p className="text-gray-400 text-sm">Xem bảng so sánh chi tiết các tính năng và thông số</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
