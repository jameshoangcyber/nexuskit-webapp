"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { notFound } from "next/navigation"
import { api } from "@/lib/api"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [navigationProducts, setNavigationProducts] = useState<{ prev: any; next: any }>({ prev: null, next: null })

  useEffect(() => {
    fetchProduct()
    fetchNavigationProducts()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const productData = await api.getProduct(params.id)
      setProduct(productData)
    } catch (error) {
      console.error("Error fetching product:", error)
      notFound()
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNavigationProducts = async () => {
    try {
      // Get all products to find prev/next
      const response = await api.getProducts({ limit: 100 })
      const allProducts = response.products || []

      const currentIndex = allProducts.findIndex((p: any) => p.id === params.id)
      if (currentIndex !== -1) {
        const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null
        const nextProduct = currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null
        setNavigationProducts({ prev: prevProduct, next: nextProduct })
      }
    } catch (error) {
      console.error("Error fetching navigation products:", error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    for (let i = 0; i < quantity; i++) {
      addToCart(product)
    }
    toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`)
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast.success(`Đã xóa ${product.name} khỏi danh sách yêu thích`)
    } else {
      addToWishlist(product)
      toast.success(`Đã thêm ${product.name} vào danh sách yêu thích`)
    }
  }

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      smartphone: "Smartphone",
      laptop: "Laptop",
      tablet: "Tablet",
      smartwatch: "Smartwatch",
      audio: "Audio",
      gaming: "Gaming",
      smarthome: "Smart Home",
      accessories: "Phụ kiện",
    }
    return categories[category] || category
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const images = product.images || [product.image]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/products" className="inline-flex items-center text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách sản phẩm
          </Link>

          {/* Product Navigation */}
          <div className="flex items-center space-x-4">
            {navigationProducts.prev && (
              <Link href={`/products/${navigationProducts.prev.id}`}>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sản phẩm trước
                </Button>
              </Link>
            )}
            {navigationProducts.next && (
              <Link href={`/products/${navigationProducts.next.id}`}>
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Sản phẩm tiếp theo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-800">
                <Image
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? "border-blue-500" : "border-gray-600"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600">{getCategoryName(product.category)}</Badge>
                <Link href={`/products/category/${product.category}`}>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                    Xem thêm {getCategoryName(product.category)}
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.averageRating) ? "text-yellow-400 fill-current" : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-400 ml-2">
                  ({product.averageRating?.toFixed(1) || 0}) • {product.totalReviews} đánh giá
                </span>
              </div>
              <p className="text-4xl font-bold text-blue-400 mb-6">{formatPrice(product.price)}</p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-4">
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  product.stock > 10
                    ? "bg-green-900/20 text-green-400"
                    : product.stock > 0
                      ? "bg-yellow-900/20 text-yellow-400"
                      : "bg-red-900/20 text-red-400"
                }`}
              >
                {product.stock > 10 ? "Còn hàng" : product.stock > 0 ? `Chỉ còn ${product.stock} sản phẩm` : "Hết hàng"}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-gray-300">Số lượng:</label>
              <div className="flex items-center border border-gray-600 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-300 hover:text-white"
                >
                  -
                </button>
                <span className="px-4 py-2 text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-300 hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 flex-1"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`border-gray-600 hover:bg-gray-800 ${
                  isInWishlist(product.id) ? "text-red-400 border-red-600" : "text-gray-300"
                }`}
                onClick={handleWishlistToggle}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 text-sm">Miễn phí vận chuyển</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 text-sm">Bảo hành 12 tháng</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 text-sm">Đổi trả 30 ngày</span>
              </div>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="description" className="text-gray-300 data-[state=active]:text-white">
                  Mô tả
                </TabsTrigger>
                <TabsTrigger value="specifications" className="text-gray-300 data-[state=active]:text-white">
                  Thông số
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-gray-300 data-[state=active]:text-white">
                  Đánh giá
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <p className="text-gray-300 leading-relaxed">{product.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Object.entries(product.specifications || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-white font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {product.reviews && product.reviews.length > 0 ? (
                    product.reviews.map((review: any) => (
                      <Card key={review.id} className="bg-gray-800 border-gray-700">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{review.user}</span>
                              <div className="flex">
                                {[...Array(review.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                            <span className="text-gray-400 text-sm">{review.date}</span>
                          </div>
                          <p className="text-gray-300">{review.comment}</p>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-400">Chưa có đánh giá nào cho sản phẩm này</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Related Products Navigation */}
        {(navigationProducts.prev || navigationProducts.next) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 border-t border-gray-700 pt-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Sản phẩm khác</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {navigationProducts.prev && (
                <Link href={`/products/${navigationProducts.prev.id}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <Image
                        src={navigationProducts.prev.image || "/placeholder.svg"}
                        alt={navigationProducts.prev.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Sản phẩm trước</p>
                        <h4 className="text-white font-medium">{navigationProducts.prev.name}</h4>
                        <p className="text-blue-400 font-semibold">{formatPrice(navigationProducts.prev.price)}</p>
                      </div>
                      <ChevronLeft className="w-5 h-5 text-gray-400" />
                    </CardContent>
                  </Card>
                </Link>
              )}
              {navigationProducts.next && (
                <Link href={`/products/${navigationProducts.next.id}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 text-right">
                        <p className="text-gray-400 text-sm">Sản phẩm tiếp theo</p>
                        <h4 className="text-white font-medium">{navigationProducts.next.name}</h4>
                        <p className="text-blue-400 font-semibold">{formatPrice(navigationProducts.next.price)}</p>
                      </div>
                      <Image
                        src={navigationProducts.next.image || "/placeholder.svg"}
                        alt={navigationProducts.next.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
