"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">Trang không tồn tại</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
