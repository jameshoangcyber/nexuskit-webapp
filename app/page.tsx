"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Smartphone, Zap, Shield, Wifi, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function HomePage() {
  const features = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Thiết kế Hiện đại",
      description: "Thiết kế tinh tế, sang trọng với chất liệu cao cấp",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Hiệu suất Mạnh mẽ",
      description: "Chip xử lý tiên tiến, đa nhiệm mượt mà",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bảo mật Tuyệt đối",
      description: "Công nghệ bảo mật sinh trắc học tiên tiến",
    },
    {
      icon: <Wifi className="w-8 h-8" />,
      title: "Kết nối Vượt trội",
      description: "Hỗ trợ 5G, WiFi 7 và các chuẩn kết nối mới nhất",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                NexusKit
                <span className="block text-blue-400">Công nghệ hội tụ</span>
                <span className="block">trong tay bạn</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Khám phá thế hệ sản phẩm công nghệ tiên tiến nhất. Trải nghiệm sức mạnh của tương lai ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Mua Ngay
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Khám phá thêm
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=600&width=500"
                  alt="NexusKit Product"
                  width={500}
                  height={600}
                  className="w-full max-w-md mx-auto"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              NexusKit được trang bị những công nghệ tiên tiến nhất để mang đến trải nghiệm tuyệt vời
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors h-full">
                  <CardContent className="p-6 text-center">
                    <div className="text-blue-400 mb-4 flex justify-center">{feature.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Sẵn sàng trải nghiệm tương lai?</h2>
            <p className="text-xl text-gray-400 mb-8">
              Đừng bỏ lỡ cơ hội sở hữu những sản phẩm công nghệ tiên tiến nhất
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Xem Sản phẩm
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Đăng ký ngay
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Khách hàng nói gì về chúng tôi</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4">
                      "Sản phẩm tuyệt vời! Chất lượng vượt mong đợi và dịch vụ khách hàng rất tốt."
                    </p>
                    <div className="text-sm text-gray-400">- Khách hàng hài lòng</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
