"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, X } from "lucide-react"
import { api } from "@/lib/api"

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
  }) => void
  isLoading?: boolean
}

export default function ProductFilters({ onFiltersChange, isLoading }: ProductFiltersProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [showFilters, setShowFilters] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await api.getCategories()
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [])

  const handleApplyFilters = () => {
    onFiltersChange({
      search: search || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number.parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseInt(maxPrice) : undefined,
      sortBy,
      sortOrder,
    })
  }

  const handleClearFilters = () => {
    setSearch("")
    setCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("name")
    setSortOrder("asc")
    onFiltersChange({})
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
            onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Bộ lọc nâng cao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Range */}
              <div>
                <Label className="text-gray-300">Giá từ (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-gray-300">Giá đến (VNĐ)</Label>
                <Input
                  type="number"
                  placeholder="100000000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Category Filter */}
              <div>
                <Label className="text-gray-300">Danh mục</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="">Tất cả danh mục</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <Label className="text-gray-300">Sắp xếp theo</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder={sortBy} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="name">Tên sản phẩm</SelectItem>
                    <SelectItem value="price">Giá</SelectItem>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Order */}
              <div>
                <Label className="text-gray-300">Thứ tự</Label>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder={sortOrder} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="asc">Tăng dần</SelectItem>
                    <SelectItem value="desc">Giảm dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Đang tìm..." : "Áp dụng"}
              </Button>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
