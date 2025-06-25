import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NexusKit - Công nghệ hội tụ trong tay bạn",
  description: "Khám phá thế hệ sản phẩm công nghệ tiên tiến nhất. Trải nghiệm sức mạnh của tương lai ngay hôm nay.",
  keywords: "NexusKit, công nghệ, smartphone, thiết bị điện tử",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1F2937",
              color: "#FFFFFF",
              border: "1px solid #374151",
            },
          }}
        />
      </body>
    </html>
  )
}
