"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchSuggestion {
  id: string
  name: string
  category: string
  price: number
  image: string
}

interface SearchHistory {
  query: string
  timestamp: number
}

export default function AdvancedSearch() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [popularSearches] = useState([
    "iPhone",
    "MacBook",
    "Samsung",
    "Gaming Laptop",
    "Wireless Headphones",
    "Smart Watch",
    "iPad",
    "Gaming Mouse",
  ])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Load search history from localStorage
    const saved = localStorage.getItem("nexuskit-search-history")
    if (saved) {
      setSearchHistory(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await api.getProducts({ search: query, limit: 5 })
        setSuggestions(response.products || [])
      } catch (error) {
        console.error("Search error:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // Add to search history
    const newHistory = [
      { query: searchQuery, timestamp: Date.now() },
      ...searchHistory.filter((h) => h.query !== searchQuery).slice(0, 9),
    ]
    setSearchHistory(newHistory)
    localStorage.setItem("nexuskit-search-history", JSON.stringify(newHistory))

    // Navigate to search results
    router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
    setIsOpen(false)
    setQuery("")
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("nexuskit-search-history")
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm, thương hiệu..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(query)
            }
          }}
          className="pl-10 pr-12 h-12 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery("")}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border-gray-700 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {/* Search Suggestions */}
            {query.length >= 2 && (
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Gợi ý sản phẩm</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-12 h-12 bg-gray-700 rounded"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded mb-1"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 transition-colors"
                      >
                        <img
                          src={product.image || "/placeholder.svg?height=48&width=48"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{product.name}</p>
                          <p className="text-gray-400 text-xs">{product.category}</p>
                        </div>
                        <p className="text-blue-400 text-sm font-medium">
                          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(product.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Không tìm thấy sản phẩm phù hợp</p>
                )}
              </div>
            )}

            {/* Search History */}
            {query.length < 2 && searchHistory.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Tìm kiếm gần đây
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(item.query)}
                      className="block w-full text-left p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded text-sm transition-colors"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Searches */}
            {query.length < 2 && (
              <div className="p-4 border-t border-gray-700">
                <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Tìm kiếm phổ biến
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                      onClick={() => handleSearch(search)}
                    >
                      {search}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
