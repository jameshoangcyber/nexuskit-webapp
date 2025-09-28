"use client"

import Link from "next/link"
import { ShoppingCart, User, Menu, X, Heart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useStore } from "@/lib/store"
import { useState } from "react"
import { cn } from "@/lib/utils"
import AdvancedSearch from "@/components/search/advanced-search"

const productCategories = [
  { id: "smartphone", name: "Smartphone", href: "/products/category/smartphone" },
  { id: "laptop", name: "Laptop", href: "/products/category/laptop" },
  { id: "tablet", name: "Tablet", href: "/products/category/tablet" },
  { id: "smartwatch", name: "Smartwatch", href: "/products/category/smartwatch" },
  { id: "audio", name: "Audio & Headphones", href: "/products/category/audio" },
  { id: "gaming", name: "Gaming", href: "/products/category/gaming" },
  { id: "smarthome", name: "Smart Home", href: "/products/category/smarthome" },
  { id: "accessories", name: "Accessories", href: "/products/category/accessories" },
]

export default function Navbar() {
  const { getCartItemsCount, getWishlistCount, user, isAuthenticated } = useStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const cartItemsCount = getCartItemsCount()
  const wishlistCount = getWishlistCount()

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-white font-bold text-xl">NexusKit</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <AdvancedSearch />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Trang chủ
            </Link>
            <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
              Sản phẩm
            </Link>

            {/* Product Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-300 hover:text-white transition-colors">
                  Danh mục
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700">
                {productCategories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link
                      href={category.href}
                      className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                    >
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link
                    href="/products"
                    className="text-blue-400 hover:text-blue-300 hover:bg-gray-700 cursor-pointer font-medium"
                  >
                    Xem tất cả sản phẩm
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/compare" className="text-gray-300 hover:text-white transition-colors">
              So sánh
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Wishlist */}
            <Link href="/wishlist" className="relative">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

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

        {/* Mobile Search */}
        <div className="md:hidden py-3 border-t border-gray-800">
          <AdvancedSearch />
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
          )}
        >
          <div className="py-4 space-y-2 border-t border-gray-800">
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
            <Link
              href="/compare"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              So sánh sản phẩm
            </Link>

            {/* Mobile Categories */}
            <div className="px-4 py-2">
              <div className="text-gray-400 text-sm font-medium mb-2">Danh mục sản phẩm</div>
              <div className="space-y-1 ml-4">
                {productCategories.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="block px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-800 rounded text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/wishlist"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Yêu thích ({wishlistCount})
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
