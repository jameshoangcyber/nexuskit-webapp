"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, Package } from "lucide-react"

interface ProductFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  isLoading?: boolean
}

const productCategories = [
  { value: "all", label: "Tất cả danh mục", count: 20 },
  { value: "smartphone", label: "Smartphone", count: 3 },
  { value: "laptop", label: "Laptop", count: 3 },
  { value: "tablet", label: "Tablet", count: 2 },
  { value: "smartwatch", label: "Smartwatch", count: 2 },
  { value: "audio", label: "Audio & Headphones", count: 2 },
  { value: "gaming", label: "Gaming", count: 2 },
  { value: "smarthome", label: "Smart Home", count: 2 },
  { value: "accessories", label: "Accessories", count: 4 },
]

const priceRanges = [
  { value: "all", label: "Tất cả mức giá" },
  { value: "0-10000000", label: "Dưới 10 triệu" },
  { value: "10000000-25000000", label: "10 - 25 triệu" },
  { value: "25000000-50000000", label: "25 - 50 triệu" },
  { value: "50000000-100000000", label: "50 - 100 triệu" },
  { value: "100000000-999999999", label: "Trên 100 triệu" },
]

const sortOptions = [
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "rating-desc", label: "Đánh giá cao nhất" },
  { value: "newest", label: "Mới nhất" },
]

export default function ProductFilters({ filters, onFiltersChange, isLoading = false }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  useEffect(() => {
    // Count active filters
    let count = 0
    if (filters.search) count++
    if (filters.category !== "all") count++
    if (filters.priceRange !== "all") count++
    setActiveFiltersCount(count)
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    let newFilters = { ...filters }
    if (key === "sortBy") {
      newFilters.sortBy = value
    } else {
      newFilters[key] = value
    }
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      category: "all",
      priceRange: "all",
      sortBy: "name-asc",
      sortOrder: "asc",
    })
  }

  const clearFilter = (filterKey: string) => {
    let newFilters = { ...filters }
    if (filterKey === "search") {
      newFilters.search = ""
    } else if (filterKey === "category") {
      newFilters.category = "all"
    } else if (filterKey === "priceRange") {
      newFilters.priceRange = "all"
    }
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-6">
      {/* Search and Quick Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <Package className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {productCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-white hover:bg-gray-700">
                      <div className="flex items-center justify-between w-full">
                        <span>{category.label}</span>
                        <Badge variant="secondary" className="ml-2 bg-gray-600 text-gray-300">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={isLoading}
            >
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
              {activeFiltersCount > 0 && <Badge className="ml-2 bg-blue-600 text-white">{activeFiltersCount}</Badge>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              Bộ lọc nâng cao
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Price Range */}
            <div>
              <Label className="text-gray-300 mb-2 block">Khoảng giá</Label>
              <Select
                value={filters.priceRange}
                onValueChange={(value) => handleFilterChange("priceRange", value)}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Chọn khoảng giá" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {priceRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value} className="text-white hover:bg-gray-700">
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                disabled={isLoading || activeFiltersCount === 0}
              >
                Xóa tất cả bộ lọc
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              Tìm kiếm: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter("search")}
                className="ml-1 h-auto p-0 text-white hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge variant="secondary" className="bg-green-600 text-white">
              Danh mục: {productCategories.find((c) => c.value === filters.category)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter("category")}
                className="ml-1 h-auto p-0 text-white hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {filters.priceRange !== "all" && (
            <Badge variant="secondary" className="bg-purple-600 text-white">
              Giá: {priceRanges.find((p) => p.value === filters.priceRange)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter("priceRange")}
                className="ml-1 h-auto p-0 text-white hover:text-gray-300"
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
