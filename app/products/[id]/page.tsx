"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockProducts } from "@/lib/mock-data"
import { formatPrice } from "@/lib/utils"
import { useStore } from "@/lib/store"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingCart, Star, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { notFound } from "next/navigation"

interface ProductDetailPageProps {
  params: {
    id: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { addToCart } = useStore()
  const [selectedImage, setSelectedImage] = useState(0)

  const product = mockProducts.find((p) => p.id === params.id)

  if (!product) {
    notFound()
  }

  const handleAddToCart = () => {
    addToCart(product)
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`)
  }

  const images = [product.image, product.image, product.image] // Mock multiple images

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link href="/products" className="inline-flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách sản phẩm
        </Link>

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
              <div className="flex space-x-2">
                {images.map((image, index) => (
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
              <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 ml-2">({product.reviews.length} đánh giá)</span>
              </div>
              <p className="text-4xl font-bold text-blue-400 mb-6">{formatPrice(product.price)}</p>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleAddToCart} size="lg" className="bg-blue-600 hover:bg-blue-700 flex-1">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Link href="/cart">
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Mua ngay
                </Button>
              </Link>
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
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
                          <span className="text-gray-400">{key}:</span>
                          <span className="text-white font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {product.reviews.map((review) => (
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
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
