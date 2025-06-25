"use client"

import Link from "next/link"
import { ShoppingCart, User, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { getCartItemsCount, user, isAuthenticated } = useStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartItemsCount = getCartItemsCount()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-xl">NexusKit</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
              Sản phẩm
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User */}
            {isAuthenticated() ? (
              <div className="flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <User className="w-5 h-5 mr-2" />
                    {user?.name}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Đăng nhập
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
          )}
        >
          <div className="py-4 space-y-2">
            <Link
              href="/"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/products"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
