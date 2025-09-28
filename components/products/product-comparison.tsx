"use client"

import { useState, useEffect } from "react"
import { X, Plus, Check, Minus, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

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

interface ProductComparisonProps {
  initialProducts?: Product[]
  onRemoveProduct?: (productId: string) => void
  onClearAll?: () => void
}

export default function ProductComparison({
  initialProducts = [],
  onRemoveProduct,
  onClearAll,
}: ProductComparisonProps) {
  const [compareProducts, setCompareProducts] = useState<Product[]>(initialProducts)
  const [allSpecs, setAllSpecs] = useState<string[]>([])

  useEffect(() => {
    setCompareProducts(initialProducts)
  }, [initialProducts])

  useEffect(() => {
    // Extract all unique specifications
    const specs = new Set<string>()
    compareProducts.forEach((product) => {
      Object.keys(product.specifications || {}).forEach((spec) => specs.add(spec))
    })
    setAllSpecs(Array.from(specs).sort())
  }, [compareProducts])

  const removeProduct = (productId: string) => {
    setCompareProducts((prev) => prev.filter((p) => p.id !== productId))
    onRemoveProduct?.(productId)
  }

  const getSpecValue = (product: Product, spec: string) => {
    return product.specifications?.[spec] || "N/A"
  }

  const renderSpecValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <div className="flex items-center justify-center">
          <Check className="w-4 h-4 text-green-400" />
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <Minus className="w-4 h-4 text-red-400" />
        </div>
      )
    }
    return <span className="text-center block">{value?.toString() || "N/A"}</span>
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center justify-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-600"}`}
          />
        ))}
        <span className="text-xs text-gray-400 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  if (compareProducts.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">So sánh sản phẩm</h3>
          <p className="text-gray-400 mb-4">Thêm sản phẩm để bắt đầu so sánh tính năng và giá cả</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            So sánh sản phẩm ({compareProducts.length}/4)
            {compareProducts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCompareProducts([])
                  onClearAll?.()
                }}
                className="text-gray-400 hover:text-white"
              >
                Xóa tất cả
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4 text-gray-400 font-medium sticky left-0 bg-gray-800 z-10">Thông tin</th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="p-4 min-w-64">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProduct(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-600 hover:bg-red-700 text-white rounded-full z-10"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="text-center">
                          <Image
                            src={product.image || "/placeholder.svg?height=150&width=150"}
                            alt={product.name}
                            width={150}
                            height={150}
                            className="mx-auto mb-3 rounded-lg object-cover"
                          />
                          <h3 className="font-semibold text-white mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
                          <Badge variant="secondary" className="mb-2">
                            {product.category}
                          </Badge>
                          <p className="text-2xl font-bold text-blue-400 mb-2">{formatPrice(product.price)}</p>
                          {renderStars(product.averageRating || 0)}
                          <div className="mt-3">
                            <Link href={`/products/${product.id}`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 w-full mb-2">
                                Xem chi tiết
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Stock Status */}
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-gray-400 font-medium sticky left-0 bg-gray-800">Tình trạng kho</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <Badge
                        variant={product.stock > 0 ? "default" : "destructive"}
                        className={product.stock > 0 ? "bg-green-600" : "bg-red-600"}
                      >
                        {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
                      </Badge>
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-gray-400 font-medium sticky left-0 bg-gray-800">Mô tả</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center text-white text-sm">
                      <div className="line-clamp-3">{product.description}</div>
                    </td>
                  ))}
                </tr>

                {/* Specifications */}
                {allSpecs.map((spec) => (
                  <tr key={spec} className="border-t border-gray-700">
                    <td className="p-4 text-gray-400 font-medium capitalize sticky left-0 bg-gray-800">
                      {spec.replace(/([A-Z])/g, " $1").trim()}
                    </td>
                    {compareProducts.map((product) => (
                      <td key={product.id} className="p-4 text-white">
                        {renderSpecValue(getSpecValue(product, spec))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
