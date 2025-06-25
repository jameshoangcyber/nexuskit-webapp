"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Package } from "lucide-react"

const productCategories = [
  {
    id: "smartphone",
    name: "Smartphone",
    description: "Điện thoại thông minh với công nghệ tiên tiến",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 3,
    href: "/products/category/smartphone",
    color: "bg-blue-600",
  },
  {
    id: "laptop",
    name: "Laptop",
    description: "Máy tính xách tay cho mọi nhu cầu",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 3,
    href: "/products/category/laptop",
    color: "bg-purple-600",
  },
  {
    id: "tablet",
    name: "Tablet",
    description: "Máy tính bảng di động và linh hoạt",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 2,
    href: "/products/category/tablet",
    color: "bg-green-600",
  },
  {
    id: "smartwatch",
    name: "Smartwatch",
    description: "Đồng hồ thông minh theo dõi sức khỏe",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 2,
    href: "/products/category/smartwatch",
    color: "bg-red-600",
  },
  {
    id: "audio",
    name: "Audio & Headphones",
    description: "Tai nghe và thiết bị âm thanh chất lượng cao",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 2,
    href: "/products/category/audio",
    color: "bg-yellow-600",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Thiết bị gaming cho trải nghiệm tuyệt vời",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 2,
    href: "/products/category/gaming",
    color: "bg-indigo-600",
  },
  {
    id: "smarthome",
    name: "Smart Home",
    description: "Thiết bị nhà thông minh hiện đại",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 2,
    href: "/products/category/smarthome",
    color: "bg-teal-600",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Phụ kiện và thiết bị hỗ trợ",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 4,
    href: "/products/category/accessories",
    color: "bg-orange-600",
  },
]

export default function ProductCategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <Package className="w-12 h-12 text-blue-400 mr-4" />
            <h1 className="text-4xl font-bold text-white">Danh mục sản phẩm</h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Khám phá bộ sưu tập đa dạng các sản phẩm công nghệ được phân loại theo từng danh mục chuyên biệt
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={category.href}>
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all duration-300 h-full group cursor-pointer">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={`absolute top-4 left-4 ${category.color} text-white px-3 py-1 rounded-full text-sm font-medium`}
                    >
                      {category.productCount} sản phẩm
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      Xem danh mục
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Tổng quan danh mục</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">{productCategories.length}</div>
                <div className="text-gray-400">Danh mục sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {productCategories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </div>
                <div className="text-gray-400">Tổng số sản phẩm</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400 mb-2">100%</div>
                <div className="text-gray-400">Chất lượng đảm bảo</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
