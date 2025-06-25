"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react"
import toast from "react-hot-toast"

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart, clearWishlist } = useStore()

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId)
    toast.success(`Đã xóa ${productName} khỏi danh sách yêu thích`)
  }

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const handleClearWishlist = () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm yêu thích?")) {
      clearWishlist()
      toast.success("Đã xóa tất cả sản phẩm yêu thích")
    }
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Heart className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Danh sách yêu thích trống</h1>
            <p className="text-gray-400 mb-8">Bạn chưa có sản phẩm yêu thích nào</p>
            <Link href="/products">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Khám phá sản phẩm
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Danh sách yêu thích</h1>
            <div className="flex gap-4">
              <span className="text-gray-400">{wishlist.length} sản phẩm</span>
              {wishlist.length > 0 && (
                <Button
                  onClick={handleClearWishlist}
                  variant="outline"
                  className="border-red-600 text-red-400 hover:bg-red-900/20"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
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
                  <Button
                    onClick={() => handleRemoveFromWishlist(product.id, product.name)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 p-2"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
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
                      ({product.averageRating?.toFixed(1) || 0}) • {product.totalReviews || 0} đánh giá
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
      </div>
    </div>
  )
}
